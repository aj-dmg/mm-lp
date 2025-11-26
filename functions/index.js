// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getCalendarClient, getServiceUsageClient } = require('./calendar-utils');
const crypto = require('crypto');

admin.initializeApp();

// Get the webhook signature key from Firebase config.
// SET THIS by running: firebase functions:config:set square.signature_key="YOUR_KEY_FROM_SQUARE_DASHBOARD"
const SQUARE_WEBHOOK_SIGNATURE_KEY = functions.config().square?.signature_key;

/**
 * Finds a contact by email or creates a new one if not found within the Cloud Function context.
 * @param {object} contactDetails - The contact's name, email, and phone.
 * @returns {Promise<string>} The ID of the existing or newly created contact.
 */
const findOrCreateContact = async (contactDetails) => {
  const { email, name, phone } = contactDetails;
  const contactsRef = admin.firestore().collection('contacts');
  
  const q = contactsRef.where('email', '==', email).limit(1);
  const snapshot = await q.get();

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  } else {
    const newContactRef = await contactsRef.add({ name, email, phone });
    return newContactRef.id;
  }
};

// 1. Create & share calendar for a driver
exports.createDriverCalendar = functions.https.onCall(async (data, context) => {
  const { driverName, driverEmail, driverId } = data;
  if (!driverName || !driverEmail || !driverId) throw new functions.https.HttpsError('invalid-argument', 'Missing driver info.');

  try {
    // Verify that the Google Calendar API is enabled for the project first.
    const serviceUsage = await getServiceUsageClient();
    const PROJECT_ID = 'projects/midnightmadnesspartybus';
    const CALENDAR_API_SERVICE_NAME = `${PROJECT_ID}/services/calendar-json.googleapis.com`;

    const { data: serviceState } = await serviceUsage.services.get({
        name: CALENDAR_API_SERVICE_NAME,
    });

    if (serviceState.state !== 'ENABLED') {
        const errorMessage = `The Google Calendar API is not enabled for project 'midnightmadnesspartybus'.`;
        const detailedError = `
            Action Failed: ${errorMessage}

            ---
            Please follow these steps to fix this:

            1. **Go to the Google Cloud Console:**
               - Open this direct link: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=midnightmadnesspartybus

            2. **Enable the API:**
               - Click the "ENABLE" button at the top of the page.

            3. **Retry the operation:**
               - After the API is enabled, please try adding or syncing the driver again.
        `;
        throw new functions.https.HttpsError('failed-precondition', detailedError);
    }

    functions.logger.info(`Starting calendar creation for driver: ${driverName} (${driverId})`);
    const calendar = await getCalendarClient();

    // Step 1: Create the calendar
    const calendarRes = await calendar.calendars.insert({
      requestBody: {
        summary: `Midnight Madness - ${driverName}`,
        description: `Personal trip calendar for ${driverName}`,
        timeZone: 'America/Edmonton',
      }
    });
    functions.logger.info('Step 1: Google Calendar created successfully.', { driverId, calendarData: calendarRes.data });
    const calendarId = calendarRes.data.id;

    // Step 2: Share calendar
    const aclRes = await calendar.acl.insert({
      calendarId,
      requestBody: {
        role: 'writer', // 'reader' if view-only desired
        scope: { type: 'user', value: driverEmail }
      }
    });
    functions.logger.info('Step 2: Google Calendar shared successfully with driver.', { driverId, driverEmail, aclData: aclRes.data });


    // Step 3: Record calendar info in Firestore
    await admin.firestore().collection('drivers').doc(driverId).update({
      googleCalendarId: calendarId,
      calendarStatus: 'ok',
      calendarCreated: admin.firestore.FieldValue.serverTimestamp(),
      calendarManaged: true
    });
    functions.logger.info('Step 3: Firestore updated with new calendar ID.', { driverId, calendarId });

    return { calendarId, calendarName: calendarRes.data.summary };
  } catch (err) {
    // This new, robust catch block prevents generic "internal" errors.
    functions.logger.error("A step in the createDriverCalendar workflow failed:", { 
        driverId, 
        error_stack: err.stack, 
        error_message: err.message,
        full_error: err
    });
    
    // If it's an HttpsError we've already constructed (like the API check), re-throw it.
    if (err.code && err.httpErrorCode) {
        throw err;
    }

    let message = "An unknown server error occurred.";
    // Prioritize the specific error message from the Google API response.
    if (err.response?.data?.error?.message) {
      message = err.response.data.error.message;
    } else if (err.message) {
      message = err.message;
    }

    // Always throw an HttpsError so the client gets a structured response.
    // Use 'failed-precondition' as the code to ensure the message is not overridden by the client SDK.
    throw new functions.https.HttpsError('failed-precondition', message, { originalError: message });
  }
});

// 2. Add event to a driver's calendar
exports.addDriverEvent = functions.https.onCall(async (data, context) => {
  const { calendarId, booking, driverId } = data;
  const calendar = await getCalendarClient();

  let retries = 0;
  while (retries < 3) {
    try {
      const result = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `Trip: ${booking.busName}`,
          description: `Client: ${booking.customerName}\nPickup: ${booking.pickupLocation}\nPassengers: ${booking.passengerCount || '-'}\nPhone: ${booking.customerPhone || '-'}`,
          start: { dateTime: booking.startTime, timeZone: 'America/Edmonton' },
          end: { dateTime: booking.endTime, timeZone: 'America/Edmonton' },
          colorId: booking.colorId || '2', // assign colors if desired
          reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }, { method: 'email', minutes: 60 }] },
        },
        sendUpdates: 'all'
      });
      // Store eventId for updates/cancels
      await admin.firestore().collection('bookings').doc(booking.id).update({
        calendarEventId: result.data.id,
        eventLastSync: admin.firestore.FieldValue.serverTimestamp(),
        eventSyncStatus: 'ok'
      });
      return { eventId: result.data.id };
    } catch (err) {
      retries++;
      if (retries >= 3) {
        const specificGoogleError = err.response?.data?.error?.message || err.message || "Unknown error during event insert.";
        functions.logger.error("addDriverEvent failed after 3 retries.", { bookingId: booking.id, error: specificGoogleError });
        await admin.firestore().collection('drivers').doc(driverId).update({
          calendarError: specificGoogleError,
          calendarStatus: 'error'
        });
        throw new functions.https.HttpsError('aborted', `Google Calendar insert failed: ${specificGoogleError}`, { originalError: specificGoogleError });
      }
      await new Promise(r => setTimeout(r, 1000 * retries));
    }
  }
});

// 3. Remove event from a driver's calendar
exports.removeDriverEvent = functions.https.onCall(async (data, context) => {
  const { calendarId, eventId, driverId, bookingId } = data;
  const calendar = await getCalendarClient();
  try {
    await calendar.events.delete({ calendarId, eventId });
    await admin.firestore().collection('bookings').doc(bookingId).update({
      eventSyncStatus: 'deleted',
      eventLastSync: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
  } catch (err) {
     // Gracefully handle if the event is already gone
     if (err.response?.status === 404 || err.response?.status === 410) {
        functions.logger.warn("Attempted to delete a Google Calendar event that was not found.", { eventId });
        await admin.firestore().collection('bookings').doc(bookingId).update({
            eventSyncStatus: 'deleted',
            eventLastSync: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, message: "Event already deleted or not found." };
    }
    
    const specificGoogleError = err.response?.data?.error?.message || err.message || "Unknown error during event deletion.";
    functions.logger.error("removeDriverEvent failed.", { bookingId, error: specificGoogleError });
    await admin.firestore().collection('drivers').doc(driverId).update({
      calendarError: specificGoogleError,
      calendarStatus: 'error'
    });
    throw new functions.https.HttpsError('aborted', `Google Calendar delete failed: ${specificGoogleError}`, { originalError: specificGoogleError });
  }
});

// 4. Create an Express Booking (status: 'pending')
exports.createExpressBooking = functions.https.onCall(async (data, context) => {
    const { busId, contact, startTime, endTime, passengerCount } = data;

    if (!busId || !contact || !contact.name || !contact.email || !contact.phone || !startTime || !endTime || !passengerCount) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required booking information.');
    }

    try {
        const contactId = await findOrCreateContact(contact);
        
        const newBooking = {
            busId,
            contactId,
            startTime: admin.firestore.Timestamp.fromDate(new Date(startTime)),
            endTime: admin.firestore.Timestamp.fromDate(new Date(endTime)),
            passengerCount,
            pickupLocation: 'Express Booking', // Default placeholder
            dropoffLocation: 'Express Booking', // Default placeholder
            status: 'pending',
            bookingType: 'express-1hr', // Identifier for this type of booking
        };

        const docRef = await admin.firestore().collection('bookings').add(newBooking);
        functions.logger.info(`Express booking created with ID: ${docRef.id}`, { booking: newBooking });
        return { bookingId: docRef.id };

    } catch (error) {
        functions.logger.error('Error creating express booking:', error);
        throw new functions.https.HttpsError('internal', 'Could not create the booking. Please try again.');
    }
});


// 5. Square Webhook Listener
exports.squareWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    functions.logger.warn(`Received non-POST request to webhook: ${req.method}`);
    return res.status(405).send('Method Not Allowed');
  }

  // --- Verify Signature ---
  if (!SQUARE_WEBHOOK_SIGNATURE_KEY) {
    functions.logger.error("Square webhook signature key is not configured. Aborting.");
    return res.status(500).send("Internal Server Error: Missing signature key.");
  }
  const signature = req.get('x-square-signature');
  const url = `https://us-central1-midnightmadnesspartybus.cloudfunctions.net/squareWebhook`; // IMPORTANT: Use your deployed function URL
  const requestBody = JSON.stringify(req.body);

  const hmac = crypto.createHmac('sha256', SQUARE_WEBHOOK_SIGNATURE_KEY);
  hmac.update(url + requestBody);
  const hash = hmac.digest('base64');

  if (hash !== signature) {
    functions.logger.error("Webhook signature validation failed.", { received: signature, calculated: hash });
    return res.status(401).send('Unauthorized');
  }

  // --- Process Event ---
  const event = req.body;
  if (event.type === 'payment.updated') {
    const payment = event.data.object.payment;

    if (payment.status === 'COMPLETED') {
      const email = payment.buyer_email_address;
      const amount = payment.amount_money.amount; // In cents, e.g., 30000 for $300
      const currency = payment.amount_money.currency;

      functions.logger.info("Processing completed payment webhook.", { email, amount, currency });

      // Match payment to a pending booking
      // We look for a recent, pending, 1-hour express booking for the correct bus and email.
      if (email && amount === 30000 && currency === 'CAD') {
        // First find the contact by email
        const contactsRef = admin.firestore().collection('contacts');
        const contactQuery = contactsRef.where('email', '==', email).limit(1);
        const contactSnapshot = await contactQuery.get();
        
        if (contactSnapshot.empty) {
            functions.logger.warn("Received a valid payment but could not find a matching contact.", { email });
            return res.status(200).send('OK');
        }
        
        const contactId = contactSnapshot.docs[0].id;
        
         const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
         const query = admin.firestore().collection('bookings')
            .where('contactId', '==', contactId)
            .where('status', '==', 'pending')
            .where('bookingType', '==', 'express-1hr')
            .where('startTime', '>=', admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
            .orderBy('startTime', 'desc')
            .limit(1);
        
        const snapshot = await query.get();

        if (!snapshot.empty) {
            const bookingDoc = snapshot.docs[0];
            functions.logger.info(`Found matching pending booking: ${bookingDoc.id}`);
            await bookingDoc.ref.update({ 
                status: 'confirmed',
                squarePaymentId: payment.id, // Store for reference
            });
            functions.logger.info(`Booking ${bookingDoc.id} confirmed successfully.`);
        } else {
            functions.logger.warn("Received a valid payment but could not find a matching pending booking for this contact.", { email, contactId });
        }
      }
    }
  }

  // Acknowledge receipt of the webhook
  return res.status(200).send('OK');
});

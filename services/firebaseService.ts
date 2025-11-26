// src/services/firebaseService.ts
import firebase from 'firebase/compat/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  initializeFirestore,
  setLogLevel,
  collection,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  writeBatch,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  deleteField,
  deleteDoc,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
import { Bus, Driver, Booking, CorporateClient, Contact } from '../types';
import { BUSES as INITIAL_BUSES, DRIVERS as INITIAL_DRIVERS, INITIAL_BOOKINGS, INITIAL_CORPORATE_CLIENTS, INITIAL_CONTACTS } from '../constants';

// Initialize Firebase
// We use the compat library for the App initialization to ensure compatibility across various environments,
// but cast it to 'any' to pass it into the modular SDK functions (getAuth, getFunctions, etc.) which expect a FirebaseApp type.
const app = (firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig)) as any;

export const auth = getAuth(app);
export const functions = getFunctions(app);

// Initialize Firestore with settings for robustness
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Use long polling to avoid flaky WebChannel connections
  useFetchStreams: false,
});

// Set log level based on environment
if (process.env.NODE_ENV === 'development') {
  setLogLevel('debug');
} else {
  setLogLevel('error');
}

/**
 * Attempt to authenticate the user anonymously.
 * If the project has restrictive settings (admin-restricted-operation), we catch the error 
 * and log a warning, allowing the app to proceed in a "read-only" or "fallback" mode.
 */
export const authenticate = async () => {
  try {
    await signInAnonymously(auth);
  } catch (error: any) {
    if (error.code === 'auth/admin-restricted-operation' || error.code === 'auth/operation-not-allowed') {
        console.warn("Anonymous auth failed: Project configuration restricts anonymous sign-in. Proceeding in fallback mode.");
    } else {
        console.warn("Anonymous auth failed:", error.message);
    }
  }
};

// ----- Cloud Function Callables -----
export const createDriverCalendar = httpsCallable(functions, 'createDriverCalendar');
export const addDriverEvent = httpsCallable(functions, 'addDriverEvent');
export const removeDriverEvent = httpsCallable(functions, 'removeDriverEvent');
export const createExpressBooking = httpsCallable<{ busId: string; contact: Omit<Contact, 'id'>; startTime: string; endTime: string; passengerCount: number; }, { bookingId: string }>(functions, 'createExpressBooking');


// ----- Collection References -----
const busesCollection = collection(db, 'buses');
const driversCollection = collection(db, 'drivers');
const bookingsCollection = collection(db, 'bookings');
const corporateClientsCollection = collection(db, 'corporateClients');
const contactsCollection = collection(db, 'contacts');

// ----- Type Helpers -----
const toBookingObject = (d: any): Booking => {
  const data = d.data();
  return {
    ...data,
    id: d.id,
    startTime: (data.startTime as Timestamp).toDate(),
    endTime: (data.endTime as Timestamp).toDate(),
  };
};

// ----- One-time Fetches with Fallbacks -----
// These functions attempt to fetch from Firestore. If that fails (e.g. permission denied),
// they return the hardcoded INITIAL_DATA from constants.ts so the app remains usable.

export const getBuses = async (): Promise<Bus[]> => {
  try {
    const snap = await getDocs(query(busesCollection, orderBy('name')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Bus));
  } catch (error) {
    console.warn('getBuses failed (using fallback data):', error);
    return INITIAL_BUSES;
  }
};

export const getDrivers = async (): Promise<Driver[]> => {
  try {
    const snap = await getDocs(query(driversCollection, orderBy('name')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Driver));
  } catch (error) {
    console.warn('getDrivers failed (using fallback data):', error);
    return INITIAL_DRIVERS;
  }
};

export const getBookings = async (): Promise<Booking[]> => {
  try {
    const snap = await getDocs(bookingsCollection);
    return snap.docs.map(toBookingObject);
  } catch (error) {
    console.warn('getBookings failed:', error);
    return []; // Return empty array for bookings if fetch fails
  }
};

export const getCorporateClients = async (): Promise<CorporateClient[]> => {
  try {
    const snap = await getDocs(query(corporateClientsCollection, orderBy('name')));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as CorporateClient));
  } catch (error) {
    console.warn('getCorporateClients failed (using fallback data):', error);
    return INITIAL_CORPORATE_CLIENTS;
  }
};

export const getContacts = async (): Promise<Contact[]> => {
    try {
        const snap = await getDocs(query(contactsCollection, orderBy('name')));
        return snap.docs.map((d) => ({...d.data(), id: d.id } as Contact));
    } catch (error) {
        console.warn('getContacts failed (using fallback data):', error);
        return INITIAL_CONTACTS;
    }
};

// ----- Realtime Subscriptions with Error Callbacks -----
// Subscriptions also catch permission errors to prevent the app from crashing.

export const onBusesUpdate = (cb: (buses: Bus[]) => void, onError?: (error: Error) => void) => {
  return onSnapshot(
    query(busesCollection, orderBy('name')),
    (snap) => {
      const buses = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Bus));
      cb(buses);
    },
    (err) => {
      console.warn('onBusesUpdate warning:', err.code);
      // Suppress UI crash by NOT calling onError for permission issues, just log warning.
    }
  );
};

export const onDriversUpdate = (cb: (drivers: Driver[]) => void, onError?: (error: Error) => void) => {
  return onSnapshot(
    query(driversCollection, orderBy('name')),
    (snap) => {
      const drivers = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Driver));
      cb(drivers);
    },
    (err) => {
      console.warn('onDriversUpdate warning:', err.code);
    }
  );
};

export const onBookingsUpdate = (cb: (bookings: Booking[]) => void, onError?: (error: Error) => void) => {
  return onSnapshot(
    bookingsCollection,
    (snap) => {
      const bookings = snap.docs.map(toBookingObject);
      cb(bookings);
    },
    (err) => {
      console.warn('onBookingsUpdate warning:', err.code);
    }
  );
};

export const onCorporateClientsUpdate = (cb: (clients: CorporateClient[]) => void, onError?: (error: Error) => void) => {
  return onSnapshot(
    query(corporateClientsCollection, orderBy('name')),
    (snap) => {
      const clients = snap.docs.map((d) => ({ ...d.data(), id: d.id } as CorporateClient));
      cb(clients);
    },
    (err) => {
      console.warn('onCorporateClientsUpdate warning:', err.code);
    }
  );
};

export const onContactsUpdate = (cb: (contacts: Contact[]) => void, onError?: (error: Error) => void) => {
    return onSnapshot(
        query(contactsCollection, orderBy('name')),
        (snap) => {
            const contacts = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Contact));
            cb(contacts);
        },
        (err) => {
            console.warn('onContactsUpdate warning:', err.code);
        }
    );
};


// ----- CRUD Operations with Enhanced Error Handling -----

/**
 * Finds a contact by email or creates a new one if not found.
 * Can optionally link the contact to a corporate client.
 * @param contactDetails The contact's name, email, and phone.
 * @param corporateInfo Optional info about the corporate client.
 * @returns The ID of the existing or newly created contact.
 */
const findOrCreateContact = async (
  contactDetails: Omit<Contact, 'id'>,
  corporateInfo?: { id: string; name: string }
): Promise<string> => {
  const { email, name, phone } = contactDetails;
  
  // 1. Check if contact exists
  const q = query(contactsCollection, where('email', '==', email), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // 2. Contact exists, return ID
    const existingContact = querySnapshot.docs[0];
    return existingContact.id;
  } else {
    // 3. Contact doesn't exist, create it
    const newContactData: Omit<Contact, 'id'> = { name, email, phone };
    if (corporateInfo) {
        newContactData.corporateClientId = corporateInfo.id;
        newContactData.companyName = corporateInfo.name;
    }
    const newContactRef = await addDoc(contactsCollection, newContactData);
    return newContactRef.id;
  }
};


export const addBus = async (busData: Omit<Bus, 'id' | 'imageUrl'>): Promise<Bus> => {
  try {
    const busWithDetails = {
      ...busData,
      imageUrl: `https://picsum.photos/seed/bus${Date.now()}/600/400`,
    };
    const ref = await addDoc(busesCollection, busWithDetails);
    return { ...busWithDetails, id: ref.id };
  } catch (error) {
    console.error('addBus error:', error);
    throw new Error('Failed to add bus. Please try again.');
  }
};

export const updateBusImage = async (busId: string, newImageUrl: string): Promise<void> => {
  try {
    const ref = doc(db, 'buses', busId);
    await updateDoc(ref, { imageUrl: newImageUrl });
  } catch (error) {
    console.error('updateBusImage error:', error);
    throw new Error('Failed to update bus image. Please try again.');
  }
};

export const addDriver = async (driverData: Omit<Driver, 'id' | 'imageUrl' | 'googleCalendarId'>): Promise<Driver> => {
  try {
    const driverWithImage = {
      ...driverData,
      imageUrl: `https://picsum.photos/seed/driver${Date.now()}/100/100`,
    };
    const ref = await addDoc(driversCollection, driverWithImage);
    return { ...driverWithImage, id: ref.id };
  } catch (error) {
    console.error('addDriver error:', error);
    throw new Error('Failed to add driver. Please try again.');
  }
};

export const updateDriverImage = async (driverId: string, newImageUrl: string): Promise<void> => {
  try {
    const ref = doc(db, 'drivers', driverId);
    await updateDoc(ref, { imageUrl: newImageUrl });
  } catch (error) {
    console.error('updateDriverImage error:', error);
    throw new Error('Failed to update driver image. Please try again.');
  }
};

export const updateDriverDetails = async (
  driverId: string,
  details: Partial<Omit<Driver, 'id' | 'imageUrl'>>
): Promise<void> => {
  try {
    const ref = doc(db, 'drivers', driverId);
    await updateDoc(ref, details);
  } catch (error) {
    console.error('updateDriverDetails error:', error);
    throw new Error('Failed to update driver details. Please try again.');
  }
};

export const updateBusDetails = async (
  busId: string,
  details: Partial<Omit<Bus, 'id' | 'imageUrl'>>
): Promise<void> => {
  try {
    const ref = doc(db, 'buses', busId);
    await updateDoc(ref, details);
  } catch (error) {
    console.error('updateBusDetails error:', error);
    throw new Error('Failed to update bus details. Please try again.');
  }
};

export const createBooking = async (
  bookingDetails: Partial<Omit<Booking, 'id' | 'status' | 'contactId' | 'startTime' | 'endTime'>> & { startTime: Date, endTime: Date },
  contactDetails: Omit<Contact, 'id'>,
  corporateInfo?: { id: string; name: string }
): Promise<Booking> => {
  try {
    const contactId = await findOrCreateContact(contactDetails, corporateInfo);
    
    const toAdd = {
      ...bookingDetails,
      contactId,
      status: 'pending' as const,
      paymentStatus: 'unpaid' as const,
      startTime: Timestamp.fromDate(bookingDetails.startTime),
      endTime: Timestamp.fromDate(bookingDetails.endTime),
    };
    
    const ref = await addDoc(bookingsCollection, toAdd);
    
    // Construct the full booking object to return
    const newBooking = {
        ...bookingDetails,
        id: ref.id,
        contactId,
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
    };
    
    return newBooking as Booking;
  } catch (error) {
    console.error('createBooking error:', error);
    throw new Error('Failed to create booking. Please try again.');
  }
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    const ref = doc(db, 'bookings', bookingId);
    await updateDoc(ref, { status: 'cancelled' });
  } catch (error) {
    console.error('cancelBooking error:', error);
    throw new Error('Failed to cancel booking. Please try again.');
  }
};

export const confirmBooking = async ({
  bookingId,
  driverId,
}: {
  bookingId: string;
  driverId: string;
}): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const snap = await getDoc(bookingRef);
    if (!snap.exists()) {
      throw new Error('Booking request not found.');
    }

    const booking = toBookingObject(snap);
    const { startTime: newStart, endTime: newEnd, busId } = booking;

    // Check bus availability by fetching confirmed bookings for the bus and checking
    // for overlaps on the client. This is more robust if composite indexes are not configured.
    const busQ = query(
      bookingsCollection,
      where('status', '==', 'confirmed'),
      where('busId', '==', busId)
    );
    const busSnap = await getDocs(busQ);
    const busConflict = busSnap.docs.some((d) => {
      const b = toBookingObject(d);
      // Full overlap check: (StartA < EndB) and (StartB < EndA)
      return b.id !== bookingId && newStart < b.endTime && b.startTime < newEnd;
    });
    if (busConflict) {
      throw new Error('This bus is already booked for the selected time slot.');
    }

    // Check driver availability similarly.
    const driverQ = query(
      bookingsCollection,
      where('status', '==', 'confirmed'),
      where('driverId', '==', driverId)
    );
    const driverSnap = await getDocs(driverQ);
    const driverConflict = driverSnap.docs.some((d) => {
      const b = toBookingObject(d);
       // Full overlap check
      return b.id !== bookingId && newStart < b.endTime && b.startTime < newEnd;
    });
    if (driverConflict) {
      throw new Error('The selected driver is already booked for this time slot.');
    }

    // Atomically update booking
    await updateDoc(bookingRef, {
      driverId,
      status: 'confirmed',
    });
  } catch (error: any) {
    console.error('confirmBooking error:', error);
    // Re-throw known errors, wrap unknown ones
    if (error.message.includes('already booked') || error.message.includes('not found')) {
      throw error;
    }
    throw new Error('Failed to confirm booking. Please try again.');
  }
};

export const updateBooking = async (
  bookingId: string,
  bookingUpdates: Partial<Omit<Booking, 'id' | 'busId' | 'status' | 'contactId'>>,
  contactUpdates: Partial<Omit<Contact, 'id'>>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const bookingRef = doc(db, 'bookings', bookingId);
    
    // 1. Get original booking to perform checks and get contactId
    const snap = await getDoc(bookingRef);
    if (!snap.exists()) {
      throw new Error('Booking not found and cannot be updated.');
    }
    const originalBooking = toBookingObject(snap);

    const newStart = bookingUpdates.startTime || originalBooking.startTime;
    const newEnd = bookingUpdates.endTime || originalBooking.endTime;
    const busId = originalBooking.busId;
    const driverId = bookingUpdates.driverId || originalBooking.driverId;

    // 2. Conflict Checks (Bus and Driver)
    const busQ = query(bookingsCollection, where('status', '==', 'confirmed'), where('busId', '==', busId));
    const busSnap = await getDocs(busQ);
    const busConflict = busSnap.docs.some(d => {
      const b = toBookingObject(d);
      return b.id !== bookingId && newStart < b.endTime && b.startTime < newEnd;
    });
    if (busConflict) {
      throw new Error('Bus conflict detected. The bus is already booked for this time.');
    }
    if (driverId) {
        const driverQ = query(bookingsCollection, where('status', '==', 'confirmed'), where('driverId', '==', driverId));
        const driverSnap = await getDocs(driverQ);
        const driverConflict = driverSnap.docs.some(d => {
            const b = toBookingObject(d);
            return b.id !== bookingId && newStart < b.endTime && b.startTime < newEnd;
        });
        if (driverConflict) {
            throw new Error('Driver conflict detected. This driver is already scheduled for this time.');
        }
    }
    
    // 3. Prepare Booking Updates
    const bookingDataToUpdate: { [key: string]: any } = { ...bookingUpdates };
    if (bookingUpdates.startTime) bookingDataToUpdate.startTime = Timestamp.fromDate(bookingUpdates.startTime);
    if (bookingUpdates.endTime) bookingDataToUpdate.endTime = Timestamp.fromDate(bookingUpdates.endTime);
    batch.update(bookingRef, bookingDataToUpdate);
    
    // 4. Prepare Contact Updates
    if (Object.keys(contactUpdates).length > 0) {
        const contactRef = doc(db, 'contacts', originalBooking.contactId);
        batch.update(contactRef, contactUpdates);
    }
    
    // 5. Commit Batch
    await batch.commit();

  } catch (error: any) {
    console.error('updateBooking error:', error);
    if (error.message.includes('conflict detected') || error.message.includes('not found')) {
        throw error;
    }
    throw new Error('Failed to update the booking. Please try again.');
  }
};

// ----- NEW CONTACT CRUD -----
export const addContact = async (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
  try {
    const ref = await addDoc(contactsCollection, contactData);
    return { ...contactData, id: ref.id };
  } catch (error) {
    console.error('addContact error:', error);
    throw new Error('Failed to add contact.');
  }
};

export const updateContact = async (contactId: string, contactData: Partial<Omit<Contact, 'id'>>): Promise<void> => {
  try {
    const ref = doc(db, 'contacts', contactId);
    await updateDoc(ref, contactData);
  } catch (error) {
    console.error('updateContact error:', error);
    throw new Error('Failed to update contact.');
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  try {
    // Note: This does not handle unlinking from bookings, which is acceptable for this app's scope.
    const ref = doc(db, 'contacts', contactId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('deleteContact error:', error);
    throw new Error('Failed to delete contact.');
  }
};

// ----- NEW CORPORATE CLIENT CRUD -----
export const addCorporateClient = async (
  clientData: Omit<CorporateClient, 'id'>,
  primaryContactData: Omit<Contact, 'id' | 'corporateClientId' | 'companyName'>
): Promise<void> => {
  try {
    const newClientRef = doc(collection(db, 'corporateClients'));
    const newContactRef = doc(collection(db, 'contacts'));

    await runTransaction(db, async (transaction) => {
      // 1. Set the new corporate client
      transaction.set(newClientRef, clientData);

      // 2. Set the new primary contact, linking it to the client
      const contactWithLink: Omit<Contact, 'id'> = {
        ...primaryContactData,
        corporateClientId: newClientRef.id,
        companyName: clientData.name,
      };
      transaction.set(newContactRef, contactWithLink);
    });
  } catch (error) {
    console.error('addCorporateClient error:', error);
    throw new Error('Failed to create new customer page and primary contact.');
  }
};

export const updateCorporateClient = async (
  clientId: string,
  clientData: Partial<Omit<CorporateClient, 'id'>>
): Promise<void> => {
  const clientRef = doc(db, 'corporateClients', clientId);
  
  try {
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) throw new Error("Client not found!");
    const oldName = clientSnap.data().name;

    const batch = writeBatch(db);
    batch.update(clientRef, clientData);
    
    if (clientData.name && clientData.name !== oldName) {
      const contactsQuery = query(contactsCollection, where('corporateClientId', '==', clientId));
      const contactsSnap = await getDocs(contactsQuery);
      contactsSnap.forEach(contactDoc => {
        batch.update(contactDoc.ref, { companyName: clientData.name });
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('updateCorporateClient error:', error);
    throw new Error('Failed to update customer page.');
  }
};

export const deleteCorporateClient = async (clientId: string): Promise<void> => {
  const clientRef = doc(db, 'corporateClients', clientId);
  const contactsQuery = query(contactsCollection, where('corporateClientId', '==', clientId));
  
  try {
    const contactsSnap = await getDocs(contactsQuery);
    const batch = writeBatch(db);

    // Unlink all associated contacts
    contactsSnap.forEach(contactDoc => {
      batch.update(contactDoc.ref, {
        corporateClientId: deleteField(),
        companyName: deleteField(),
      });
    });

    // Delete the corporate client
    batch.delete(clientRef);

    await batch.commit();
  } catch (error) {
    console.error('deleteCorporateClient error:', error);
    throw new Error('Failed to delete customer page and unlink contacts.');
  }
};


// ----- Idempotent Database Seeding -----
let isSeeding = false;
export const seedDatabase = async (): Promise<void> => {
  if (isSeeding) return;
  isSeeding = true;
  
  try {
    const batch = writeBatch(db);
    
    // Use set with { merge: true } to create if not exists, or update if changed in code.
    // This is idempotent and safe to run on every startup.
    INITIAL_BUSES.forEach((bus) => {
      const { id, ...data } = bus;
      batch.set(doc(busesCollection, id), data, { merge: true });
    });

    INITIAL_DRIVERS.forEach((driver) => {
      const { id, ...data } = driver;
      batch.set(doc(driversCollection, id), data, { merge: true });
    });

    INITIAL_CONTACTS.forEach((contact) => {
        const { id, ...data } = contact;
        batch.set(doc(contactsCollection, id), data, { merge: true });
    });

    INITIAL_CORPORATE_CLIENTS.forEach((client) => {
        const { id, ...data } = client;
        batch.set(doc(corporateClientsCollection, id), data, { merge: true });
    });

    // We don't seed bookings to avoid overwriting user-created data.
    // The INITIAL_BOOKINGS array is empty anyway.

    await batch.commit();
    console.log('Initial data sync complete.');
  } catch (error: any) {
    if (error.code === 'permission-denied') {
        console.warn('seedDatabase: Permission denied. Skipping seed (Client does not have write access).');
    } else {
        console.error('seedDatabase error:', error);
    }
  } finally {
    isSeeding = false;
  }
};

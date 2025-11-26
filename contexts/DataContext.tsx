// src/contexts/DataContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import { Bus, Driver, Booking, CorporateClient, Contact } from '../types';
import * as firebaseService from '../services/firebaseService';

interface DataContextState {
  buses: Bus[];
  drivers: Driver[];
  bookings: Booking[];
  corporateClients: CorporateClient[];
  contacts: Contact[];
  loading: boolean;
  addBus: (busData: Omit<Bus, 'id' | 'imageUrl'>) => Promise<Bus>;
  updateBusImage: (busId: string, newImageUrl: string) => Promise<void>;
  updateDriverImage: (driverId: string, newImageUrl: string) => Promise<void>;
  createBooking: (bookingDetails: Partial<Omit<Booking, 'id' | 'status' | 'contactId' | 'startTime' | 'endTime'>> & { startTime: Date, endTime: Date }, contactDetails: Omit<Contact, 'id'>, corporateInfo?: { id: string, name: string }) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  confirmBooking: (options: { bookingId: string; driverId: string; }) => Promise<void>;
  addDriver: (driverData: Omit<Driver, 'id' | 'imageUrl' | 'googleCalendarId'>) => Promise<Driver>;
  updateDriverDetails: (driverId: string, details: Partial<Omit<Driver, 'id' | 'imageUrl'>>) => Promise<void>;
  updateBusDetails: (busId: string, details: Partial<Omit<Bus, 'id' | 'imageUrl'>>) => Promise<void>;
  updateBooking: (bookingId: string, bookingUpdates: Partial<Omit<Booking, 'id' | 'busId' | 'status' | 'contactId'>>, contactUpdates: Partial<Omit<Contact, 'id'>>) => Promise<void>;
  syncCalendarForDriver: (driverId: string) => Promise<void>;
  // Contact CRUD
  addContact: (contactData: Omit<Contact, 'id'>) => Promise<Contact>;
  updateContact: (contactId: string, contactData: Partial<Omit<Contact, 'id'>>) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  // Corporate Client CRUD
  addCorporateClient: (clientData: Omit<CorporateClient, 'id'>, primaryContactData: Omit<Contact, 'id' | 'corporateClientId' | 'companyName'>) => Promise<void>;
  updateCorporateClient: (clientId: string, clientData: Partial<Omit<CorporateClient, 'id'>>) => Promise<void>;
  deleteCorporateClient: (clientId: string) => Promise<void>;
}

export const DataContext = createContext<DataContextState | undefined>(undefined);

/**
 * Intelligently and safely extracts the most specific error message from a Firebase HttpsError.
 * This function provides a detailed troubleshooting guide if a generic "internal" error is received.
 * @param error The error object caught from a `httpsCallable` call.
 * @returns A detailed, human-readable error string.
 */
const getFirebaseErrorMessage = (error: any): string => {
  const defaultMessage = 'An unknown error occurred. Please check the function logs or contact support.';

  // Most specific: The 'details' object from our custom HttpsError, which contains the exact API error.
  if (error?.details?.originalError && typeof error.details.originalError === 'string') {
    return error.details.originalError;
  }
  
  // Next best: The top-level message from the HttpsError, IF it's not generic.
  if (error?.message && typeof error.message === 'string' && !error.message.toLowerCase().includes('internal')) {
    return error.message;
  }

  // If the error message is the generic 'internal', provide a detailed troubleshooting guide.
  if (error?.message && typeof error.message === 'string' && error.message.toLowerCase().includes('internal')) {
    return `A server error occurred. This is often due to a backend configuration issue with Google Cloud or Google Workspace.

Please verify the following:

1. The Google Calendar API is ENABLED for your project ('midnightmadnesspartybus').
   - Link: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=midnightmadnesspartybus

2. Domain-Wide Delegation is configured correctly for the service account.
   - The service account's Client ID must be authorized with the 'https://www.googleapis.com/auth/calendar' scope in your Google Workspace Admin console.

3. The impersonation account is set in Firebase config.
   - A Google Workspace admin email must be configured on the server. Please contact your developer to ensure this is set.

If you have verified all these steps, please try again.`;
  }

  return defaultMessage;
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [corporateClients, setCorporateClients] = useState<CorporateClient[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribers: (() => void)[] = [];
    const loadData = async () => {
      try {
        setLoading(true);

        // Try to authenticate anonymously. If it fails (restricted project), it will catch and log a warning, allowing read-only fallbacks.
        await firebaseService.authenticate();
        
        // We attempt to seed the database, but if permissions are denied (common for clients),
        // the service will catch the error and log a warning instead of crashing.
        await firebaseService.seedDatabase();

        // Perform an initial fetch. If fetching fails due to permissions/network, the service returns empty arrays or fallback data.
        const [initialBuses, initialDrivers, initialBookings, initialCorporateClients, initialContacts] = await Promise.all([
          firebaseService.getBuses(),
          firebaseService.getDrivers(),
          firebaseService.getBookings(),
          firebaseService.getCorporateClients(),
          firebaseService.getContacts(),
        ]);

        setBuses(initialBuses);
        setDrivers(initialDrivers);
        setBookings(initialBookings);
        setCorporateClients(initialCorporateClients);
        setContacts(initialContacts);

        // After the initial load, set up real-time listeners for updates
        unsubscribers.push(firebaseService.onBusesUpdate(setBuses));
        unsubscribers.push(firebaseService.onDriversUpdate(setDrivers));
        unsubscribers.push(firebaseService.onBookingsUpdate(setBookings));
        unsubscribers.push(firebaseService.onCorporateClientsUpdate(setCorporateClients));
        unsubscribers.push(firebaseService.onContactsUpdate(setContacts));

      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const addBus = useCallback(async (busData: Omit<Bus, 'id' | 'imageUrl'>): Promise<Bus> => {
    return firebaseService.addBus(busData);
  }, []);
  
  const updateBusImage = useCallback(async (busId: string, newImageUrl: string): Promise<void> => {
    return firebaseService.updateBusImage(busId, newImageUrl);
  }, []);
  
  const updateDriverImage = useCallback(async (driverId: string, newImageUrl: string): Promise<void> => {
    return firebaseService.updateDriverImage(driverId, newImageUrl);
  }, []);
  
  const createBooking = useCallback(async (bookingDetails: Partial<Omit<Booking, 'id' | 'status' | 'contactId' | 'startTime' | 'endTime'>> & { startTime: Date, endTime: Date }, contactDetails: Omit<Contact, 'id'>, corporateInfo?: { id: string, name: string }): Promise<Booking> => {
    return firebaseService.createBooking(bookingDetails, contactDetails, corporateInfo);
  }, []);
  
  const cancelBooking = useCallback(async (bookingId: string): Promise<void> => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && booking.driverId && booking.calendarEventId) {
        const driver = drivers.find(d => d.id === booking.driverId!);
        if (driver && driver.googleCalendarId) {
            try {
                await firebaseService.removeDriverEvent({
                    calendarId: driver.googleCalendarId,
                    eventId: booking.calendarEventId,
                    driverId: driver.id,
                    bookingId: booking.id,
                });
            } catch (error) {
                console.error("Failed to remove event from Google Calendar:", error);
                alert(`Could not remove the event from Google Calendar: ${getFirebaseErrorMessage(error)}. You may need to remove it manually. The booking will still be cancelled in the system.`);
            }
        }
    }
    return firebaseService.cancelBooking(bookingId);
  }, [bookings, drivers]);

  const confirmBooking = useCallback(async ({ bookingId, driverId }: { bookingId: string; driverId: string; }): Promise<void> => {
    // Confirm booking first
    await firebaseService.confirmBooking({ bookingId, driverId });
    
    // Then, try to sync to calendar
    try {
        // Need to get the latest booking and contact data for calendar event
        const bookingDoc = await firebaseService.getBookings().then(all => all.find(b => b.id === bookingId));
        const contact = bookingDoc ? contacts.find(c => c.id === bookingDoc.contactId) : null;
        const driver = drivers.find(d => d.id === driverId);
        const bus = buses.find(b => b.id === bookingDoc?.busId);

        if (bookingDoc && driver && driver.googleCalendarId && bus && contact) {
            await firebaseService.addDriverEvent({
                driverId: driver.id,
                calendarId: driver.googleCalendarId,
                booking: {
                    id: bookingDoc.id,
                    busName: bus.name,
                    pickupLocation: bookingDoc.pickupLocation,
                    passengerCount: bookingDoc.passengerCount,
                    startTime: bookingDoc.startTime.toISOString(),
                    endTime: bookingDoc.endTime.toISOString(),
                    customerName: contact.name,
                    customerPhone: contact.phone,
                }
            });
            // The cloud function updates the booking with the calendarEventId
        } else if (driver && !driver.googleCalendarId) {
            console.warn(`Booking confirmed, but driver ${driver.name} does not have a synced Google Calendar.`);
            alert(`Booking confirmed, but driver ${driver.name} does not have a synced Google Calendar. Please sync their calendar from the 'Manage Drivers' tab.`);
        }
    } catch (error) {
        console.error("Failed to add event to Google Calendar:", error);
        alert(`Booking confirmed, but failed to add event to Google Calendar: ${getFirebaseErrorMessage(error)}`);
    }
  }, [drivers, buses, contacts]);
  
  const addDriver = useCallback(async (driverData: Omit<Driver, 'id' | 'imageUrl' | 'googleCalendarId'>): Promise<Driver> => {
    const newDriver = await firebaseService.addDriver(driverData);
    try {
        await firebaseService.createDriverCalendar({
            driverId: newDriver.id,
            driverName: newDriver.name,
            driverEmail: newDriver.email,
        });
        // The cloud function updates the driver doc with the googleCalendarId,
        // which will be picked up by our real-time listener.
    } catch (error: any) {
        console.error("Failed to create Google Calendar for driver:", error);
        const specificMessage = getFirebaseErrorMessage(error);
        throw new Error(`Driver created, but calendar sync failed: ${specificMessage}. You can retry from the 'Manage Drivers' tab.`);
    }
    return newDriver;
  }, []);
  
  const syncCalendarForDriver = useCallback(async (driverId: string): Promise<void> => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver || !driver.email) {
        throw new Error("Driver not found or missing email.");
    }
    if (driver.googleCalendarId) {
        console.log("Driver already has a synced calendar.");
        return;
    }
    try {
        await firebaseService.createDriverCalendar({
            driverId: driver.id,
            driverName: driver.name,
            driverEmail: driver.email,
        });
    } catch (error: any) {
        console.error("Failed to create Google Calendar for driver:", error);
        const specificMessage = getFirebaseErrorMessage(error);
        throw new Error(`Google Calendar sync failed: ${specificMessage}`);
    }
  }, [drivers]);


  const updateDriverDetails = useCallback(async (driverId: string, details: Partial<Omit<Driver, 'id' | 'imageUrl'>>): Promise<void> => {
    return firebaseService.updateDriverDetails(driverId, details);
  }, []);

  const updateBusDetails = useCallback(async (busId: string, details: Partial<Omit<Bus, 'id' | 'imageUrl'>>) => {
    return firebaseService.updateBusDetails(busId, details);
  }, []);

  const updateBooking = useCallback(async (bookingId: string, bookingUpdates: Partial<Omit<Booking, 'id' | 'busId' | 'status' | 'contactId'>>, contactUpdates: Partial<Omit<Contact, 'id'>>) => {
    return firebaseService.updateBooking(bookingId, bookingUpdates, contactUpdates);
  }, []);

  // Contact CRUD wrappers
  const addContact = useCallback(async (contactData: Omit<Contact, 'id'>) => firebaseService.addContact(contactData), []);
  const updateContact = useCallback(async (contactId: string, contactData: Partial<Omit<Contact, 'id'>>) => firebaseService.updateContact(contactId, contactData), []);
  const deleteContact = useCallback(async (contactId: string) => firebaseService.deleteContact(contactId), []);
  
  // Corporate Client CRUD wrappers
  const addCorporateClient = useCallback(async (clientData: Omit<CorporateClient, 'id'>, primaryContactData: Omit<Contact, 'id' | 'corporateClientId' | 'companyName'>) => firebaseService.addCorporateClient(clientData, primaryContactData), []);
  const updateCorporateClient = useCallback(async (clientId: string, clientData: Partial<Omit<CorporateClient, 'id'>>) => firebaseService.updateCorporateClient(clientId, clientData), []);
  const deleteCorporateClient = useCallback(async (clientId: string) => firebaseService.deleteCorporateClient(clientId), []);

  const value = {
    buses,
    drivers,
    bookings,
    corporateClients,
    contacts,
    loading,
    addBus,
    updateBusImage,
    updateDriverImage,
    createBooking,
    cancelBooking,
    confirmBooking,
    addDriver,
    updateDriverDetails,
    updateBusDetails,
    updateBooking,
    syncCalendarForDriver,
    addContact,
    updateContact,
    deleteContact,
    addCorporateClient,
    updateCorporateClient,
    deleteCorporateClient,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

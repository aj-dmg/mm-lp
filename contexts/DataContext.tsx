import React, { createContext, useState, ReactNode, useContext } from 'react';
import { Bus, Driver, Booking, CorporateClient, Contact } from '../types';
import { BUSES as INITIAL_BUSES, DRIVERS as INITIAL_DRIVERS, INITIAL_CORPORATE_CLIENTS, INITIAL_CONTACTS } from '../constants';

interface DataContextState {
  buses: Bus[];
  drivers: Driver[];
  bookings: Booking[];
  corporateClients: CorporateClient[];
  contacts: Contact[];
  loading: boolean;
  createBooking: (
    bookingDetails: Partial<Omit<Booking, 'id' | 'status' | 'contactId' | 'startTime' | 'endTime'>> & { startTime: Date, endTime: Date },
    contactDetails: Omit<Contact, 'id'>,
    corporateInfo?: { id: string, name: string }
  ) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBusImage: (busId: string, newImageUrl: string) => Promise<void>;
  updateDriverImage: (driverId: string, newImageUrl: string) => Promise<void>;
  addBus: (busData: Omit<Bus, 'id' | 'imageUrl'>) => Promise<Bus>;
  addDriver: (driverData: Omit<Driver, 'id' | 'imageUrl' | 'googleCalendarId'>) => Promise<Driver>;
  syncCalendarForDriver: (driverId: string) => Promise<void>;
  confirmBooking: (params: { bookingId: string, driverId: string }) => Promise<void>;
  updateBooking: (
    bookingId: string,
    bookingUpdates: Partial<Omit<Booking, 'id' | 'busId' | 'status' | 'contactId'>>,
    contactUpdates: Partial<Omit<Contact, 'id'>>
  ) => Promise<void>;
  deleteCorporateClient: (clientId: string) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  addContact: (contactData: Omit<Contact, 'id'>) => Promise<Contact>;
  updateContact: (contactId: string, contactData: Partial<Omit<Contact, 'id'>>) => Promise<void>;
  addCorporateClient: (
    clientData: Omit<CorporateClient, 'id'>,
    primaryContactData: Omit<Contact, 'id' | 'corporateClientId' | 'companyName'>
  ) => Promise<void>;
  updateCorporateClient: (clientId: string, clientData: Partial<Omit<CorporateClient, 'id'>>) => Promise<void>;
  updateBusDetails: (busId: string, details: Partial<Omit<Bus, 'id' | 'imageUrl'>>) => Promise<void>;
  updateDriverDetails: (driverId: string, details: Partial<Omit<Driver, 'id' | 'imageUrl'>>) => Promise<void>;
}

export const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [buses, setBuses] = useState<Bus[]>(INITIAL_BUSES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [corporateClients, setCorporateClients] = useState<CorporateClient[]>(INITIAL_CORPORATE_CLIENTS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [loading] = useState(false);

  // Helper to simulate delay
  const delay = () => new Promise(resolve => setTimeout(resolve, 500));

  const createBooking = async (
    bookingDetails: Partial<Omit<Booking, 'id' | 'status' | 'contactId' | 'startTime' | 'endTime'>> & { startTime: Date, endTime: Date },
    contactDetails: Omit<Contact, 'id'>,
    corporateInfo?: { id: string; name: string }
  ): Promise<Booking> => {
    await delay();
    
    // Simple mock logic for contact creation/retrieval
    const contactId = `contact-${Date.now()}`;
    const newContact: Contact = { 
        id: contactId, 
        ...contactDetails, 
        corporateClientId: corporateInfo?.id, 
        companyName: corporateInfo?.name 
    };
    // In this static version, we update local state to reflect the "new" contact
    setContacts(prev => [...prev, newContact]);

    const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        busId: bookingDetails.busId || 'unknown-bus',
        contactId: contactId,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        pickupLocation: bookingDetails.pickupLocation || '',
        dropoffLocation: bookingDetails.dropoffLocation || '',
        passengerCount: bookingDetails.passengerCount || 0,
        status: 'pending',
        paymentStatus: 'unpaid',
        ...bookingDetails
    } as Booking;

    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const cancelBooking = async (bookingId: string) => {
    await delay();
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  const updateBusImage = async (busId: string, newImageUrl: string) => {
    await delay();
    setBuses(prev => prev.map(b => b.id === busId ? { ...b, imageUrl: newImageUrl } : b));
  };

  const updateDriverImage = async (driverId: string, newImageUrl: string) => {
    await delay();
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, imageUrl: newImageUrl } : d));
  };

  const addBus = async (busData: Omit<Bus, 'id' | 'imageUrl'>) => {
    await delay();
    const newBus: Bus = { ...busData, id: `bus-${Date.now()}`, imageUrl: 'https://picsum.photos/600/400' };
    setBuses(prev => [...prev, newBus]);
    return newBus;
  };

  const addDriver = async (driverData: Omit<Driver, 'id' | 'imageUrl' | 'googleCalendarId'>) => {
    await delay();
    const newDriver: Driver = { ...driverData, id: `driver-${Date.now()}`, imageUrl: 'https://picsum.photos/100/100' };
    setDrivers(prev => [...prev, newDriver]);
    return newDriver;
  };

  const syncCalendarForDriver = async (driverId: string) => {
      await delay();
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, googleCalendarId: 'mock-calendar-id' } : d));
  };

  const confirmBooking = async ({ bookingId, driverId }: { bookingId: string, driverId: string }) => {
      await delay();
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed', driverId } : b));
  };

  const updateBooking = async (
    bookingId: string,
    bookingUpdates: Partial<Omit<Booking, 'id' | 'busId' | 'status' | 'contactId'>>,
    contactUpdates: Partial<Omit<Contact, 'id'>>
  ) => {
      await delay();
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...bookingUpdates } : b));
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
          setContacts(prev => prev.map(c => c.id === booking.contactId ? { ...c, ...contactUpdates } : c));
      }
  };

  const deleteCorporateClient = async (clientId: string) => {
      await delay();
      setCorporateClients(prev => prev.filter(c => c.id !== clientId));
      setContacts(prev => prev.map(c => c.corporateClientId === clientId ? { ...c, corporateClientId: undefined, companyName: undefined } : c));
  };
  
  const deleteContact = async (contactId: string) => {
      await delay();
      setContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const addContact = async (contactData: Omit<Contact, 'id'>) => {
      await delay();
      const newContact: Contact = { ...contactData, id: `contact-${Date.now()}` };
      setContacts(prev => [...prev, newContact]);
      return newContact;
  };

  const updateContact = async (contactId: string, contactData: Partial<Omit<Contact, 'id'>>) => {
      await delay();
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...contactData } : c));
  };

  const addCorporateClient = async (
    clientData: Omit<CorporateClient, 'id'>,
    primaryContactData: Omit<Contact, 'id' | 'corporateClientId' | 'companyName'>
  ) => {
      await delay();
      const clientId = `client-${Date.now()}`;
      const newClient: CorporateClient = { ...clientData, id: clientId };
      const newContact: Contact = { ...primaryContactData, id: `contact-${Date.now() + 1}`, corporateClientId: clientId, companyName: clientData.name };
      
      setCorporateClients(prev => [...prev, newClient]);
      setContacts(prev => [...prev, newContact]);
  };

  const updateCorporateClient = async (clientId: string, clientData: Partial<Omit<CorporateClient, 'id'>>) => {
      await delay();
      setCorporateClients(prev => prev.map(c => c.id === clientId ? { ...c, ...clientData } : c));
      
      if (clientData.name) {
          setContacts(prev => prev.map(c => c.corporateClientId === clientId ? { ...c, companyName: clientData.name } : c));
      }
  };

  const updateBusDetails = async (busId: string, details: Partial<Omit<Bus, 'id' | 'imageUrl'>>) => {
      await delay();
      setBuses(prev => prev.map(b => b.id === busId ? { ...b, ...details } : b));
  };

  const updateDriverDetails = async (driverId: string, details: Partial<Omit<Driver, 'id' | 'imageUrl'>>) => {
      await delay();
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, ...details } : d));
  };


  const value = {
    buses,
    drivers,
    bookings,
    corporateClients,
    contacts,
    loading,
    createBooking,
    cancelBooking,
    updateBusImage,
    updateDriverImage,
    addBus,
    addDriver,
    syncCalendarForDriver,
    confirmBooking,
    updateBooking,
    deleteCorporateClient,
    deleteContact,
    addContact,
    updateContact,
    addCorporateClient,
    updateCorporateClient,
    updateBusDetails,
    updateDriverDetails,
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

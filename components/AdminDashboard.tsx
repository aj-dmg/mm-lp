import React, { useState, useMemo, useEffect } from 'react';
import { Booking, Bus, Driver, Contact } from '../types';
import { useData } from '../contexts/DataContext';
import EditableImage from './EditableImage';
import AddBusForm from './AddBusForm';
import AddDriverForm from './AddDriverForm';
import ConfirmBookingModal from './ConfirmBookingModal';
import AdminAvailabilityCalendar from './AdminAvailabilityCalendar';
import EditBookingModal from './EditBookingModal';
import CancelConfirmationModal from './CancelConfirmationModal';
import SyncConfirmationModal from './SyncConfirmationModal';
import AdminScheduleCalendar from './AdminScheduleCalendar';
import CustomerBookingAdminPage from './CustomerBookingAdminPage';
import ContactsAdminPage from './ContactsAdminPage';
import EditBusModal from './EditBusModal';
import EditDriverModal from './EditDriverModal';

type AdminView = 'schedule' | 'pending' | 'buses' | 'drivers' | 'customers' | 'contacts';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; count?: number }> = ({ active, onClick, children, count }) => (
    <button
      onClick={onClick}
      className={`relative px-4 sm:px-6 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none ${
        active
          ? 'border-b-2 border-brand-pink text-white'
          : 'border-b-2 border-transparent text-gray-400 hover:text-white'
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{count}</span>
      )}
    </button>
);

const getPaymentStatusPill = (status?: Booking['paymentStatus']) => {
    switch (status) {
        case 'paid_in_full': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800">Paid in Full</span>;
        case 'deposit_paid': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-200 text-blue-800">Deposit Paid</span>;
        case 'unpaid': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-200 text-yellow-800">Unpaid</span>;
        case 'refunded': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">Refunded</span>;
        default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800">N/A</span>;
    }
};

const AdminDashboard: React.FC = () => {
  const { 
    bookings, 
    buses, 
    drivers,
    contacts,
    loading, 
    cancelBooking, 
    updateBusImage, 
    updateDriverImage,
    addBus,
    addDriver,
    syncCalendarForDriver,
  } = useData();

  const [adminView, setAdminView] = useState<AdminView>('schedule');
  const [isAddBusModalOpen, setIsAddBusModalOpen] = useState(false);
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [bookingToConfirm, setBookingToConfirm] = useState<Booking | null>(null);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [driverToSync, setDriverToSync] = useState<Driver | null>(null);
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);
  const [busToEdit, setBusToEdit] = useState<Bus | null>(null);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  
  // Filter states
  const [filterBusId, setFilterBusId] = useState('');
  const [filterDriverId, setFilterDriverId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending'), [bookings]);

  const dataMap = useMemo(() => {
    return {
      buses: new Map(buses.map(bus => [bus.id, bus])),
      drivers: new Map(drivers.map(driver => [driver.id, driver])),
      contacts: new Map(contacts.map(contact => [contact.id, contact])),
    };
  }, [buses, drivers, contacts]);

  const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings]);

  const calendarBookings = useMemo(() => {
    let filtered = confirmedBookings;

    if (filterBusId) {
      filtered = filtered.filter(b => b.busId === filterBusId);
    }
    if (filterDriverId) {
      filtered = filtered.filter(b => b.driverId === filterDriverId);
    }
    return filtered;
  }, [confirmedBookings, filterBusId, filterDriverId]);

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = confirmedBookings;

    if (filterBusId) {
      filtered = filtered.filter(b => b.busId === filterBusId);
    }
    if (filterDriverId) {
      filtered = filtered.filter(b => b.driverId === filterDriverId);
    }
    if (filterStartDate) {
      const start = new Date(`${filterStartDate}T00:00:00`);
      filtered = filtered.filter(b => b.startTime >= start);
    }
    if (filterEndDate) {
      const end = new Date(`${filterEndDate}T23:59:59`);
      filtered = filtered.filter(b => b.startTime <= end);
    }

    filtered.sort((a, b) => {
      const comparison = a.startTime.getTime() - b.startTime.getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [confirmedBookings, filterBusId, filterDriverId, filterStartDate, filterEndDate, sortOrder]);

  const handleResetFilters = () => {
    setFilterBusId('');
    setFilterDriverId('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSortOrder('asc');
  };
  
  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
  };
  
  const handleConfirmCancel = async (bookingId: string) => {
    try {
        await cancelBooking(bookingId);
    } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert("Could not cancel the booking. Please try again.");
    } finally {
        setBookingToCancel(null);
    }
  };
  
  const handleUpdateBusImage = async (busId: string, newImageUrl: string) => {
    try {
        await updateBusImage(busId, newImageUrl);
    } catch (error) {
        console.error("Failed to update bus image:", error);
        alert("Could not update bus image. Please try again.");
    }
  };

  const handleUpdateDriverImage = async (driverId: string, newImageUrl: string) => {
    try {
        await updateDriverImage(driverId, newImageUrl);
    } catch (error) {
        console.error("Failed to update driver image:", error);
        alert("Could not update driver image. Please try again.");
    }
  };
  
  const handleOpenSyncModal = (driver: Driver) => {
    setDriverToSync(driver);
  };

  const handleConfirmSync = async (driverId: string) => {
    try {
      await syncCalendarForDriver(driverId);
    } catch (error) {
      // Re-throw the error so the modal can catch it and display it.
      console.error("Sync failed from dashboard:", error);
      throw error;
    }
  };

  const handleCopyPortalLink = (bookingId: string) => {
    // This creates a robust URL that works even if the app is not at the root of the domain.
    const url = `${window.location.href.split('#')[0]}#/portal/${bookingId}`;
    navigator.clipboard.writeText(url).then(() => {
        setCopiedBookingId(bookingId);
        setTimeout(() => setCopiedBookingId(null), 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy link.');
    });
  };

  if (loading) {
    return <div className="text-center text-xl p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-brand-pink to-brand-blue">
          Admin Dashboard
        </h1>
        <p className="text-center text-lg text-gray-400">Manage bookings, buses, and drivers.</p>
      </div>
      
      <div className="bg-night-light shadow-2xl rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-700 overflow-x-auto">
            <TabButton active={adminView === 'schedule'} onClick={() => setAdminView('schedule')}>Master Schedule</TabButton>
            <TabButton active={adminView === 'pending'} onClick={() => setAdminView('pending')} count={pendingBookings.length}>Pending Requests</TabButton>
            <TabButton active={adminView === 'buses'} onClick={() => setAdminView('buses')}>Manage Buses</TabButton>
            <TabButton active={adminView === 'drivers'} onClick={() => setAdminView('drivers')}>Manage Drivers</TabButton>
            <TabButton active={adminView === 'contacts'} onClick={() => setAdminView('contacts')}>Contacts</TabButton>
            <TabButton active={adminView === 'customers'} onClick={() => setAdminView('customers')}>Customer Pages</TabButton>
        </div>
        
        {adminView === 'schedule' && (
          <div className="p-4">
            <AdminScheduleCalendar
              bookings={calendarBookings}
              buses={buses}
              drivers={drivers}
              contacts={contacts}
              onBookingClick={setBookingToEdit}
            />
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Filter Schedule Table</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label htmlFor="bus-filter" className="block text-sm font-medium text-gray-300 mb-1">Bus</label>
                        <select id="bus-filter" value={filterBusId} onChange={e => setFilterBusId(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-2 px-3">
                            <option value="">All Buses</option>
                            {buses.map(bus => <option key={bus.id} value={bus.id}>{bus.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="driver-filter" className="block text-sm font-medium text-gray-300 mb-1">Driver</label>
                        <select id="driver-filter" value={filterDriverId} onChange={e => setFilterDriverId(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-2 px-3">
                            <option value="">All Drivers</option>
                            {drivers.map(driver => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="start-date-filter" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                        <input type="date" id="start-date-filter" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} max={filterEndDate || undefined} className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-1.5 px-3" />
                    </div>
                    <div>
                        <label htmlFor="end-date-filter" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                        <input type="date" id="end-date-filter" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} min={filterStartDate || undefined} className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-1.5 px-3" />
                    </div>
                    <div className="flex items-center justify-end">
                        <button onClick={handleResetFilters} className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm font-medium">
                            Reset
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                       <button onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))} className="flex items-center gap-1 focus:outline-none text-gray-300 hover:text-white transition-colors">
                        Date & Time
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Client</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Bus</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Driver</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-night-light divide-y divide-gray-700">
                  {filteredAndSortedBookings.map((booking) => {
                    const bus = dataMap.buses.get(booking.busId);
                    const driver = booking.driverId ? dataMap.drivers.get(booking.driverId) : null;
                    const contact = dataMap.contacts.get(booking.contactId);
                    return (
                      <tr key={booking.id} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{booking.startTime.toLocaleDateString('en-US')}</div>
                            <div className="text-xs text-gray-400">
                                {booking.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {booking.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{contact?.name || 'Unknown Client'}</div>
                          <div className="text-xs text-gray-500">{booking.passengerCount} passengers</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{bus?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{driver?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getPaymentStatusPill(booking.paymentStatus)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => setBookingToEdit(booking)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium mr-2">Edit</button>
                            <button onClick={() => handleCopyPortalLink(booking.id)} className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs font-medium mr-2 w-20 text-center">
                                {copiedBookingId === booking.id ? 'Copied!' : 'Copy Link'}
                            </button>
                            <button onClick={() => handleCancelBooking(booking)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium">Cancel</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAndSortedBookings.length === 0 && <div className="text-center p-8 text-gray-500">No confirmed bookings match the current filters.</div>}
            </div>
          </div>
        )}
        {adminView === 'pending' && (
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Pending Booking Requests</h2>
                <div className="space-y-4">
                    {pendingBookings.length > 0 ? pendingBookings.map(booking => {
                        const bus = dataMap.buses.get(booking.busId);
                        const contact = dataMap.contacts.get(booking.contactId);
                        return (
                            <div key={booking.id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <p className="font-bold text-white">{contact?.name || 'Unknown'} for {bus?.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {booking.startTime.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })} ({Math.round((booking.endTime.getTime() - booking.startTime.getTime()) / 3600000)} hrs)
                                    </p>
                                    <p className="text-sm text-gray-400">{booking.passengerCount} passengers</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => handleCancelBooking(booking)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Decline</button>
                                    <button onClick={() => setBookingToConfirm(booking)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">Review & Confirm</button>
                                </div>
                            </div>
                        );
                    }) : <p className="text-gray-500">No pending requests.</p>}
                </div>

                <div className="mt-8">
                  <AdminAvailabilityCalendar buses={buses} bookings={bookings} />
                </div>
            </div>
        )}
        {adminView === 'buses' && (
            <div className="p-6">
                 <div className="flex justify-end mb-6">
                    <button onClick={() => setIsAddBusModalOpen(true)} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-opacity-80 transition-colors text-sm font-medium">+ Add Bus</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {buses.map(bus => (
                        <div key={bus.id} className="relative bg-gray-800 p-4 rounded-lg flex flex-col items-center text-center shadow-lg">
                            <EditableImage src={bus.imageUrl} alt={bus.name} onSave={(newUrl) => handleUpdateBusImage(bus.id, newUrl)} shape="rect" />
                            <div className="w-full mt-4">
                                <div className="flex items-center justify-center gap-2">
                                    <div style={{ backgroundColor: bus.color }} className="w-3 h-3 rounded-sm border border-gray-600"></div>
                                    <h4 className="font-semibold text-white">{bus.name}</h4>
                                </div>
                                <p className="text-sm text-gray-400">Capacity: {bus.capacity}</p>
                                <p className="text-sm text-gray-400">Status: {bus.status}</p>
                                <button onClick={() => setBusToEdit(bus)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium w-full">
                                    Edit Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {adminView === 'drivers' && (
             <div className="p-6">
                <div className="flex justify-end mb-6">
                    <button onClick={() => setIsAddDriverModalOpen(true)} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-opacity-80 transition-colors text-sm font-medium">+ Add Driver</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {drivers.map(driver => (
                        <div key={driver.id} className="bg-gray-800 p-4 rounded-lg flex flex-col items-center text-center shadow-lg space-y-3">
                            <EditableImage src={driver.imageUrl} alt={driver.name} onSave={(newUrl) => handleUpdateDriverImage(driver.id, newUrl)} shape="circle" />
                            <h4 className="font-semibold text-white">{driver.name}</h4>
                            <p className="text-sm text-gray-400">Status: {driver.status}</p>
                             <div className="pt-2 w-full space-y-2">
                                <button onClick={() => setDriverToEdit(driver)} className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium">
                                    Edit Details
                                </button>
                                {driver.googleCalendarId ? (
                                    <div className="w-full flex justify-center items-center gap-2 px-3 py-2 bg-green-900/50 text-green-400 rounded-md text-xs font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Calendar Synced
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleOpenSyncModal(driver)}
                                        className="w-full flex justify-center items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-xs font-medium"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        Sync with Google Calendar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {adminView === 'contacts' && (
            <ContactsAdminPage />
        )}
        {adminView === 'customers' && (
            <CustomerBookingAdminPage />
        )}

        {/* Fix: Pass addBus prop to AddBusForm */}
        {isAddBusModalOpen && <AddBusForm onClose={() => setIsAddBusModalOpen(false)} addBus={addBus} />}
        {/* Fix: Pass addDriver prop to AddDriverForm */}
        {isAddDriverModalOpen && <AddDriverForm onClose={() => setIsAddDriverModalOpen(false)} addDriver={addDriver} />}
        {busToEdit && <EditBusModal bus={busToEdit} onClose={() => setBusToEdit(null)} />}
        {driverToEdit && <EditDriverModal driver={driverToEdit} onClose={() => setDriverToEdit(null)} />}
        {bookingToConfirm && <ConfirmBookingModal booking={bookingToConfirm} onClose={() => setBookingToConfirm(null)} />}
        {bookingToEdit && <EditBookingModal booking={bookingToEdit} onClose={() => setBookingToEdit(null)} />}
        {bookingToCancel && <CancelConfirmationModal booking={bookingToCancel} onClose={() => setBookingToCancel(null)} onConfirm={handleConfirmCancel} />}
        <SyncConfirmationModal driver={driverToSync} onClose={() => setDriverToSync(null)} onConfirm={handleConfirmSync} />
      </div>
    </div>
  );
};

export default AdminDashboard;

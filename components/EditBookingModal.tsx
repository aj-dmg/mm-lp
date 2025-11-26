import React, { useState, useMemo, useEffect } from 'react';
import { Booking, Driver, Bus, Contact } from '../types';
import { useData } from '../contexts/DataContext';
import { toTitleCase } from '../utils';

interface EditBookingModalProps {
  booking: Booking;
  onClose: () => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({ booking, onClose }) => {
    const { drivers, buses, contacts, bookings: allBookings, updateBooking } = useData();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const contact = useMemo(() => contacts.find(c => c.id === booking.contactId), [contacts, booking.contactId]);
    
    const formatDate = (date: Date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

    const [formData, setFormData] = useState({
        // Contact fields
        name: contact?.name || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        // Booking fields
        passengerCount: booking.passengerCount,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        date: formatDate(booking.startTime),
        time: formatTime(booking.startTime),
        duration: (booking.endTime.getTime() - booking.startTime.getTime()) / 3600000,
        driverId: booking.driverId || '',
        quoteAmount: booking.quoteAmount || '' as number | '',
        paymentStatus: booking.paymentStatus || 'unpaid',
        notes: booking.notes || '',
    });
    
    useEffect(() => {
        if (contact) {
            setFormData(prev => ({
                ...prev,
                name: contact.name,
                email: contact.email,
                phone: contact.phone || ''
            }));
        }
    }, [contact]);


    const bus = useMemo(() => buses.find(b => b.id === booking.busId), [buses, booking.busId]);

    const { startTime, endTime } = useMemo(() => {
        const [year, month, day] = formData.date.split('-').map(Number);
        const [hour, minute] = formData.time.split(':').map(Number);
        const start = new Date(year, month - 1, day, hour, minute);
        const end = new Date(start.getTime() + formData.duration * 3600000);
        return { startTime: start, endTime: end };
    }, [formData.date, formData.time, formData.duration]);

    const availableDrivers = useMemo(() => {
        const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
        return drivers.filter(driver => {
            const isBooked = confirmedBookings.some(b => 
                b.id !== booking.id && // Exclude the current booking from the check
                b.driverId === driver.id &&
                startTime < b.endTime &&
                endTime > b.startTime
            );
            return !isBooked;
        });
    }, [drivers, allBookings, booking.id, startTime, endTime]);
    
    useEffect(() => {
        if (formData.driverId && !availableDrivers.some(d => d.id === formData.driverId)) {
            setFormData(prev => ({ ...prev, driverId: '' }));
        }
    }, [availableDrivers, formData.driverId]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.driverId) {
            setError('Please select an available driver.');
            return;
        }
        if (bus && Number(formData.passengerCount) > bus.capacity) {
            setError(`Passenger count cannot exceed bus capacity of ${bus.capacity}.`);
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const contactUpdates: Partial<Omit<Contact, 'id'>> = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            };
            const bookingUpdates: Partial<Omit<Booking, 'id' | 'busId' | 'status' | 'contactId'>> = {
                passengerCount: Number(formData.passengerCount),
                pickupLocation: toTitleCase(formData.pickupLocation),
                dropoffLocation: toTitleCase(formData.dropoffLocation),
                startTime,
                endTime,
                driverId: formData.driverId,
                quoteAmount: Number(formData.quoteAmount) || undefined,
                paymentStatus: formData.paymentStatus as Booking['paymentStatus'],
                notes: formData.notes,
            };

            await updateBooking(booking.id, bookingUpdates, contactUpdates);
            onClose();
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!bus || !contact) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Edit Booking for {bus.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact & Trip Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-3">Trip & Client Details</h3>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Client Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Passenger Count (Max: {bus.capacity})</label>
                                <input type="number" name="passengerCount" value={formData.passengerCount} onChange={handleChange} max={bus.capacity} min="1" required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                            </div>
                        </div>
                        {/* Schedule & Logistics */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-3">Schedule & Logistics</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Start Time</label>
                                <input type="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Duration</label>
                                <select name="duration" value={formData.duration} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h} hours</option>)}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Ends at: {endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Assign Driver</label>
                                <select name="driverId" value={formData.driverId} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                                    <option value="">-- Select a driver --</option>
                                    {availableDrivers.map(driver => (
                                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                                    ))}
                                </select>
                                {availableDrivers.length === 0 && <p className="text-sm text-yellow-400 mt-2">No drivers are available for this time slot.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-300">Pickup Location</label>
                            <input type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Drop-off Location</label>
                            <input type="text" name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                        </div>
                    </div>
                    
                     <div className="space-y-4 border-t border-gray-700 pt-4 mt-4">
                         <h3 className="text-lg font-semibold">Financials & Notes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Quote Amount ($)</label>
                                <input type="number" name="quoteAmount" value={formData.quoteAmount} onChange={handleChange} min="0" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Payment Status</label>
                                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                                    <option value="unpaid">Unpaid</option>
                                    <option value="deposit_paid">Deposit Paid</option>
                                    <option value="paid_in_full">Paid in Full</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Internal Notes</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 space-x-4 border-t border-gray-700 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting || !formData.driverId} className="px-6 py-2 bg-brand-blue text-white rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookingModal;
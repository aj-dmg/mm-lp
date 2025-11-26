import React, { useState, useMemo } from 'react';
import { Booking, Driver } from '../types';
import { useData } from '../contexts/DataContext';

interface ConfirmBookingModalProps {
  booking: Booking;
  onClose: () => void;
}

const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({ booking, onClose }) => {
    const { drivers, contacts, bookings: allBookings, confirmBooking } = useData();
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contact = useMemo(() => contacts.find(c => c.id === booking.contactId), [contacts, booking.contactId]);

    const availableDrivers = useMemo(() => {
        const confirmedBookings = allBookings.filter(b => b.status === 'confirmed');
        return drivers.filter(driver => {
            const isBooked = confirmedBookings.some(b => 
                b.driverId === driver.id &&
                booking.startTime < b.endTime &&
                booking.endTime > b.startTime
            );
            return !isBooked;
        });
    }, [drivers, allBookings, booking]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDriverId) {
            setError('Please select a driver to assign.');
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await confirmBooking({ bookingId: booking.id, driverId: selectedDriverId });
            onClose();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!contact) {
        return null; // Or a loading/error state
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Review Booking Request</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
                <div className="space-y-4 text-gray-300">
                    <p><strong>Client:</strong> {contact.name} ({contact.email}, {contact.phone})</p>
                    <p><strong>Date:</strong> {booking.startTime.toLocaleDateString('en-US')}</p>
                    <p><strong>Time:</strong> {booking.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {booking.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p><strong>Trip:</strong> From <strong>{booking.pickupLocation}</strong> to <strong>{booking.dropoffLocation}</strong></p>
                    <p><strong>Passengers:</strong> {booking.passengerCount}</p>
                </div>
                <form onSubmit={handleSubmit} className="mt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Assign Driver</label>
                        <select
                            value={selectedDriverId}
                            onChange={(e) => setSelectedDriverId(e.target.value)}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white"
                        >
                            <option value="">-- Select an available driver --</option>
                            {availableDrivers.map(driver => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                            ))}
                        </select>
                        {availableDrivers.length === 0 && <p className="text-sm text-yellow-400 mt-2">No drivers are available for this time slot.</p>}
                    </div>
                    <div className="flex justify-end pt-6 space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting || availableDrivers.length === 0 || !selectedDriverId} className="px-6 py-2 text-white rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 bg-green-600">
                            {isSubmitting ? 'Confirming...' : 'Confirm & Assign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfirmBookingModal;

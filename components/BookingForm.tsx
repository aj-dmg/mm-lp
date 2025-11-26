import React, { useState, useMemo } from 'react';
import { Bus, Driver, Booking, Contact } from '../types';
import { suggestItinerary } from '../services/geminiService';
import { toTitleCase } from '../utils';

interface BookingFormProps {
  bus: Bus;
  selectedStartTime: Date;
  drivers: Driver[];
  bookings: Booking[];
  onClose: () => void;
  createBooking: (bookingDetails: Omit<Booking, 'id' | 'status' | 'contactId'>, contactDetails: Omit<Contact, 'id'>) => Promise<Booking>;
}

const BookingForm: React.FC<BookingFormProps> = ({ bus, selectedStartTime, drivers, bookings, onClose, createBooking }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [passengerCount, setPassengerCount] = useState<number | ''>('');
  const [duration, setDuration] = useState(4); // Default duration in hours
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itinerary, setItinerary] = useState('');
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

  const endTime = useMemo(() => new Date(selectedStartTime.getTime() + duration * 60 * 60 * 1000), [selectedStartTime, duration]);

  const availableDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const isBooked = bookings.some(booking => 
        booking.driverId === driver.id &&
        selectedStartTime < booking.endTime &&
        endTime > booking.startTime
      );
      return !isBooked;
    });
  }, [drivers, bookings, selectedStartTime, endTime]);

  const [driverId, setDriverId] = useState(availableDrivers[0]?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !pickupLocation || !dropoffLocation || !passengerCount || !driverId) {
      setError('Please fill out all fields and select a driver.');
      return;
    }
    if (passengerCount > bus.capacity) {
        setError(`Passenger count cannot exceed the bus capacity of ${bus.capacity}.`);
        return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const contactDetails = { name: clientName, email: clientEmail, phone: clientPhone };
      const bookingDetails = {
        busId: bus.id,
        driverId,
        startTime: selectedStartTime,
        endTime: endTime,
        pickupLocation: toTitleCase(pickupLocation),
        dropoffLocation: toTitleCase(dropoffLocation),
        passengerCount: Number(passengerCount),
      };
      await createBooking(bookingDetails, contactDetails);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGenerateItinerary = async () => {
    if(!pickupLocation || !dropoffLocation || !passengerCount) {
      alert("Please fill in pickup, dropoff, and passenger count to generate an itinerary.");
      return;
    }
    setIsGeneratingItinerary(true);
    setItinerary('');
    try {
        const suggestion = await suggestItinerary({
            pickup: pickupLocation,
            dropoff: dropoffLocation,
            passengers: Number(passengerCount),
            hours: duration 
        });
        setItinerary(suggestion);
    } catch (err) {
        setItinerary("Failed to generate itinerary.");
    } finally {
        setIsGeneratingItinerary(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Book: {bus.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <p className="text-lg mb-6 text-brand-blue">
          Booking for: {selectedStartTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-700 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Start Time</label>
                  <input type="text" readOnly value={selectedStartTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-gray-400" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-300">Duration (hours)</label>
                   <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h} hours</option>)}
                   </select>
                </div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
                End Time: {endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Your Name</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Phone</label>
              <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-300">Number of Passengers (Max: {bus.capacity})</label>
              <input type="number" value={passengerCount} onChange={(e) => setPassengerCount(Number(e.target.value))} max={bus.capacity} min="1" required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Pickup Location</label>
            <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Drop-off Location</label>
            <input type="text" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-300">Preferred Driver</label>
            <select value={driverId} onChange={(e) => setDriverId(e.target.value)} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white">
              {availableDrivers.length > 0 ? (
                availableDrivers.map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))
              ) : (
                <option value="">No drivers available for this slot</option>
              )}
            </select>
          </div>
          
          <div className="pt-4">
              <button type="button" onClick={handleGenerateItinerary} disabled={isGeneratingItinerary} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50">
                {isGeneratingItinerary ? 'Generating...' : '✨ Suggest an Itinerary (with AI)'}
              </button>
              {itinerary && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-md prose prose-invert prose-sm max-w-none">
                      <h4 className="font-bold">Itinerary Suggestion:</h4>
                      <pre className="whitespace-pre-wrap font-sans text-gray-300">{itinerary}</pre>
                  </div>
              )}
          </div>

          <div className="flex justify-end pt-6 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting || availableDrivers.length === 0} className="px-6 py-2 bg-brand-pink text-white rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
import React, { useState } from 'react';
import { Bus } from '../types';
import { useData } from '../contexts/DataContext';
import { toTitleCase } from '../utils';

interface BookingRequestFormProps {
  bus: Bus;
}

const BookingRequestForm: React.FC<BookingRequestFormProps> = ({ bus }) => {
  const { createBooking } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    passengerCount: '' as number | '',
    pickupLocation: '',
    dropoffLocation: '',
    date: '',
    time: '19:00',
    duration: 4,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formData).some(val => val === '')) {
      setError('Please fill out all fields.');
      return;
    }
    if (Number(formData.passengerCount) > bus.capacity) {
      setError(`Passenger count cannot exceed bus capacity of ${bus.capacity}.`);
      return;
    }
    
    const [year, month, day] = formData.date.split('-').map(Number);
    const [hour, minute] = formData.time.split(':').map(Number);
    const startTime = new Date(year, month - 1, day, hour, minute);

    const twelveHoursFromNow = new Date(new Date().getTime() + 12 * 60 * 60 * 1000);
    if (startTime < twelveHoursFromNow) {
        setError('Bookings must be made at least 12 hours in advance.');
        return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      const endTime = new Date(startTime.getTime() + formData.duration * 60 * 60 * 1000);
      const contactDetails = { name: formData.name, email: formData.email, phone: formData.phone };
      const bookingDetails = {
        busId: bus.id,
        startTime,
        endTime,
        pickupLocation: toTitleCase(formData.pickupLocation),
        dropoffLocation: toTitleCase(formData.dropoffLocation),
        passengerCount: Number(formData.passengerCount),
        bookingSource: 'admin_manual' as const,
      };

      await createBooking(bookingDetails, contactDetails);
      setIsSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
        <div className="text-center p-8 bg-gray-800 rounded-lg">
            <h3 className="text-2xl font-bold text-neon-green mb-4">Request Sent!</h3>
            <p className="text-gray-300">Thank you for your booking request. Our team will review the availability and get back to you shortly to confirm the details.</p>
        </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
      {error && <div className="bg-red-500 text-white p-3 rounded-md">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-800 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-300">Your Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Number of Passengers (Max: {bus.capacity})</label>
          <input type="number" name="passengerCount" value={formData.passengerCount} onChange={handleChange} max={bus.capacity} min="1" required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300">Pickup Location</label>
          <input type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300">Drop-off Location</label>
          <input type="text" name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Desired Date</label>
          <input type="date" name="date" value={formData.date} min={today} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Desired Start Time</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300">Trip Duration</label>
          <select name="duration" value={formData.duration} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{h} hours</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-brand-pink text-white rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50 font-semibold">
          {isSubmitting ? 'Submitting Request...' : 'Submit Booking Request'}
        </button>
      </div>
    </form>
  );
};

export default BookingRequestForm;
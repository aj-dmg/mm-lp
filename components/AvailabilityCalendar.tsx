import React, { useState } from 'react';
import { Bus, Booking, Driver } from '../types';
import BookingForm from './BookingForm';

interface CalendarProps {
  bus: Bus;
  bookings: Booking[];
  drivers: Driver[];
  isLoading: boolean;
  createBooking: (newBookingData: Omit<Booking, 'id' | 'status'>) => Promise<Booking>;
}

const AvailabilityCalendar: React.FC<CalendarProps> = ({ bus, bookings, drivers, isLoading, createBooking }) => {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);

  const handleDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = event.target.value.split('-').map(Number);
    // Use UTC to avoid timezone issues from the input
    setSelectedDay(new Date(Date.UTC(year, month - 1, day)));
  };

  const handleSlotClick = (slotDate: Date) => {
    setSelectedStartTime(slotDate);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setSelectedStartTime(null);
  };

  const renderTimeSlots = () => {
    const day = selectedDay.getUTCDate();
    const month = selectedDay.getUTCMonth();
    const year = selectedDay.getUTCFullYear();
    
    const timeSlots = [];
    const now = new Date();

    // Generate slots from 10:00 AM on the selected day to 4:00 AM the next day.
    for (let hour = 10; hour < 28; hour++) {
        const slotDate = new Date(Date.UTC(year, month, day, hour, 0, 0));

        const isBooked = bookings.some(booking => 
            slotDate < booking.endTime && new Date(slotDate.getTime() + 60 * 60 * 1000) > booking.startTime
        );
        
        const isPast = slotDate < now;

        let cellClass = 'p-3 rounded-md text-center transition-colors duration-200';
        let statusText = slotDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        if (isPast) {
            cellClass += ' bg-gray-700 text-gray-500 cursor-not-allowed';
            statusText = 'Past';
        } else if (isBooked) {
            cellClass += ' bg-red-800/50 text-gray-400 cursor-not-allowed';
            statusText = 'Booked';
        } else {
            cellClass += ' bg-gray-600 hover:bg-brand-blue hover:text-white cursor-pointer';
        }

        timeSlots.push(
            <div key={hour}>
                <div className="text-xs text-gray-400 mb-1">{slotDate.toLocaleTimeString([], { hour: 'numeric', hour12: true })}</div>
                <button
                    className={cellClass}
                    onClick={() => handleSlotClick(slotDate)}
                    disabled={isBooked || isPast}
                    aria-label={`Book slot at ${statusText}`}
                >
                    {statusText}
                </button>
            </div>
        );
    }
    return timeSlots;
  };

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  today.setMonth(today.getMonth() + 6);
  const maxDate = today.toISOString().split("T")[0];
  
  // Format selectedDay to YYYY-MM-DD for input value, handling timezone offset
  const selectedDayString = new Date(selectedDay.getTime() - (selectedDay.getTimezoneOffset() * 60000 ))
    .toISOString()
    .split("T")[0];


  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-center sm:text-left">Select a Day to View Hourly Slots</h3>
        <input 
            type="date"
            value={selectedDayString}
            min={minDate}
            max={maxDate}
            onChange={handleDayChange}
            className="bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-2 px-3"
        />
      </div>
      {isLoading ? (
        <div className="text-center p-10">Loading availability...</div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {renderTimeSlots()}
        </div>
      )}
      {isBookingModalOpen && selectedStartTime && (
        <BookingForm
          bus={bus}
          selectedStartTime={selectedStartTime}
          drivers={drivers}
          bookings={bookings}
          onClose={handleCloseModal}
          createBooking={createBooking}
        />
      )}
    </div>
  );
};

export default AvailabilityCalendar;
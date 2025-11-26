import React, { useMemo } from 'react';
import { Bus, Booking } from '../types';
import { useData } from '../contexts/DataContext';

interface DayDetailModalProps {
  date: Date;
  bus: Bus;
  bookings: Booking[];
  onClose: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ date, bus, bookings, onClose }) => {
  const { contacts } = useData();

  const contactMap = useMemo(() => new Map(contacts.map(c => [c.id, c])), [contacts]);

  const renderTimeSlots = () => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const timeSlots = [];

    // Generate slots for all 24 hours of the day in the local timezone
    for (let hour = 0; hour < 24; hour++) {
        const slotDate = new Date(year, month, day, hour, 0, 0);

        const bookingInSlot = bookings.find(booking => 
            // Check if the current 1-hour slot overlaps with the booking duration
            slotDate < booking.endTime && new Date(slotDate.getTime() + 60 * 60 * 1000) > booking.startTime
        );

        timeSlots.push(
            <div key={hour} className="flex items-stretch border-b border-gray-700 min-h-[60px]">
                <div className="w-24 flex-shrink-0 text-right pr-4 py-3">
                    <span className="text-sm text-gray-400 font-medium">
                        {slotDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}
                    </span>
                </div>
                <div className="flex-grow pl-4 border-l border-gray-700 py-2 flex items-center">
                    {bookingInSlot ? (
                         <div className="w-full p-2 rounded-md bg-brand-pink/20 border-l-4 border-brand-pink">
                            <p className="font-semibold text-white text-sm">Booked: {contactMap.get(bookingInSlot.contactId)?.name || 'Unknown Client'}</p>
                            <p className="text-xs text-gray-300">
                                {bookingInSlot.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {bookingInSlot.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center">
                             <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                             <span className="text-green-300 text-sm">Available</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return timeSlots;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Availability for {bus.name}</h2>
            <p className="text-lg text-brand-blue">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="overflow-y-auto flex-grow pr-2 border-t border-gray-700">
            <div className="flex flex-col">
                {renderTimeSlots()}
            </div>
        </div>
        
        <div className="flex justify-end pt-6 mt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;
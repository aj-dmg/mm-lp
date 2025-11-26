import React, { useState, useMemo } from 'react';
import { Bus, Booking } from '../types';
import DayDetailModal from './DayDetailModal';

interface AdminCalendarProps {
  buses: Bus[];
  bookings: Booking[];
}

interface BusTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color: string;
}

const BusTab: React.FC<BusTabProps> = ({ active, onClick, children, color }) => (
    <button
      onClick={onClick}
      style={{ backgroundColor: color }}
      className={`px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white ${
        active
          ? 'opacity-100 shadow-lg' // Full brightness for the selected tab
          : 'opacity-60 hover:opacity-80' // Dimmed for inactive tabs, brighter on hover
      }`}
    >
      {children}
    </button>
);


const AdminAvailabilityCalendar: React.FC<AdminCalendarProps> = ({ buses, bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBusId, setSelectedBusId] = useState<string>(buses[0]?.id || '');
  const [detailDate, setDetailDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDayOfMonth.getDay();

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    const monthBookings = bookings.filter(b => 
        b.busId === selectedBusId &&
        b.status === 'confirmed' &&
        b.startTime.getFullYear() === year &&
        b.startTime.getMonth() === month
    );
    
    monthBookings.forEach(booking => {
        // Normalize to the start of the day in the local timezone.
        const localDate = booking.startTime;
        const dayKey = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()).toISOString().split('T')[0];
        
        if (!map.has(dayKey)) {
            map.set(dayKey, []);
        }
        map.get(dayKey)!.push(booking);
    });

    return map;
  }, [bookings, selectedBusId, year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const renderCalendarGrid = () => {
    const calendarDays = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    // Blanks for days before start of month
    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`blank-${i}`} className="border border-gray-700 bg-gray-800"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day); // Use local timezone
        const dayKey = dayDate.toISOString().split('T')[0];
        const hasBooking = bookingsByDay.has(dayKey);
        const isPast = dayDate < today;

        let cellClass = 'border border-gray-700 p-2 h-24 flex flex-col items-center justify-center relative transition-colors duration-200';
        if (isPast) {
            cellClass += ' bg-gray-800 text-gray-500';
        } else if (hasBooking) {
            cellClass += ' bg-brand-pink/30 cursor-pointer hover:bg-brand-pink/50';
        } else {
            cellClass += ' bg-gray-600 cursor-pointer hover:bg-gray-500';
        }

        calendarDays.push(
            <div key={day} className={cellClass} onClick={() => !isPast && setDetailDate(dayDate)}>
                <span className="absolute top-2 left-2 text-sm">{day}</span>
                {hasBooking && (
                    <div className="text-center">
                        <span className="text-xs bg-brand-pink text-white px-2 py-1 rounded-full">Booked</span>
                    </div>
                )}
            </div>
        );
    }

    return calendarDays;
  };
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!buses.length) {
      return null;
  }

  const selectedBus = useMemo(() => buses.find(b => b.id === selectedBusId), [buses, selectedBusId]);

  return (
    <>
      <div className="p-4 sm:p-6 bg-gray-900/50 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="text-xl font-bold text-white">Bus Availability Calendar</h3>
          <div className="flex items-center gap-4">
              <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">&lt;</button>
              <span className="font-semibold w-32 text-center text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">&gt;</button>
          </div>
        </div>
        
        <div className="flex flex-wrap border-b border-gray-600 mb-4">
          {buses.map((bus) => (
              <BusTab
                key={bus.id}
                active={selectedBusId === bus.id}
                onClick={() => setSelectedBusId(bus.id)}
                color={bus.color}
              >
                  {bus.name}
              </BusTab>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {daysOfWeek.map(day => (
              <div key={day} className="text-center font-bold text-xs text-gray-400 py-2 uppercase">{day}</div>
          ))}
          {renderCalendarGrid()}
        </div>
      </div>
      {detailDate && selectedBus && (
        <DayDetailModal
            date={detailDate}
            bus={selectedBus}
            bookings={bookings.filter(b => {
                if (b.busId !== selectedBus.id || b.status !== 'confirmed' || !detailDate) return false;
                const bDate = b.startTime;
                return bDate.getFullYear() === detailDate.getFullYear() &&
                       bDate.getMonth() === detailDate.getMonth() &&
                       bDate.getDate() === detailDate.getDate();
            })}
            onClose={() => setDetailDate(null)}
        />
      )}
    </>
  );
};

export default AdminAvailabilityCalendar;
import React, { useState, useMemo } from 'react';
import { Booking, Bus, Driver, Contact } from '../types';

interface AdminScheduleCalendarProps {
  bookings: Booking[]; // Assumes bookings are pre-filtered by status, bus, and driver
  buses: Bus[];
  drivers: Driver[];
  contacts: Contact[];
  onBookingClick: (booking: Booking) => void;
}

const AdminScheduleCalendar: React.FC<AdminScheduleCalendarProps> = ({ bookings, buses, drivers, contacts, onBookingClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const dataMap = useMemo(() => ({
    drivers: new Map(drivers.map(d => [d.id, d])),
    buses: new Map(buses.map(b => [b.id, b])),
    contacts: new Map(contacts.map(c => [c.id, c])),
  }), [drivers, buses, contacts]);
  
  const busColorMap = useMemo(() => {
    return new Map(buses.map(bus => [bus.id, bus.color]));
  }, [buses]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDayOfMonth.getDay();

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    const monthBookings = bookings.filter(b => 
        b.startTime.getFullYear() === year &&
        b.startTime.getMonth() === month
    );
    
    monthBookings.forEach(booking => {
        const localDate = booking.startTime;
        const dayKey = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()).toISOString().split('T')[0];
        
        if (!map.has(dayKey)) {
            map.set(dayKey, []);
        }
        map.get(dayKey)!.push(booking);
    });
    
    for (const dayBookings of map.values()) {
        dayBookings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }
    return map;
  }, [bookings, year, month]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const renderCalendarGrid = () => {
    const calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`blank-${i}`} className="border border-gray-700/50 bg-gray-800/20"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayKey = dayDate.toISOString().split('T')[0];
        const dayBookings = bookingsByDay.get(dayKey) || [];
        const isToday = dayDate.getTime() === today.getTime();

        let cellClass = `relative border border-gray-700/50 p-1.5 h-36 flex flex-col overflow-y-auto ${isToday ? 'bg-brand-blue/10' : 'bg-night-light/50'}`;

        calendarDays.push(
            <div key={day} className={cellClass}>
                <span className={`text-xs font-semibold ${isToday ? 'text-brand-blue font-bold' : 'text-gray-400'}`}>{day}</span>
                <div className="mt-1 space-y-1">
                    {dayBookings.map(booking => {
                        const bus = dataMap.buses.get(booking.busId);
                        const driver = booking.driverId ? dataMap.drivers.get(booking.driverId) : null;
                        const contact = dataMap.contacts.get(booking.contactId);
                        const clientName = contact?.name || 'Unknown Client';
                        const busColor = bus ? busColorMap.get(bus.id) : '#6b7280';

                        return (
                            <button
                                key={booking.id}
                                onClick={() => onBookingClick(booking)}
                                style={{ backgroundColor: busColor }}
                                className="w-full text-left p-1.5 rounded-md text-white text-[10px] leading-tight hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night-light focus:ring-white"
                                title={`${bus?.name} - ${clientName} (${driver?.name})`}
                            >
                                <p className="font-bold truncate">{bus?.name}</p>
                                <p className="truncate">{clientName}</p>
                                <p className="opacity-80 truncate">{driver?.name || 'N/A'}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
    return calendarDays;
  };
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 sm:p-6 bg-gray-900/50 rounded-lg mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-xl font-bold text-white">Schedule Overview</h3>
        <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">&lt; Prev</button>
            <span className="font-semibold w-40 text-center text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Next &gt;</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 items-center">
          <span className="text-sm text-gray-400 font-medium">Bus Legend:</span>
          {buses.map(bus => (
              <div key={bus.id} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: busColorMap.get(bus.id) || '#6b7280' }}
                  ></span>
                  <span className="text-xs text-gray-300">{bus.name}</span>
              </div>
          ))}
      </div>
      
      <div className="grid grid-cols-7 text-center">
        {daysOfWeek.map(day => (
            <div key={day} className="font-bold text-xs text-gray-400 py-2 uppercase border-b-2 border-gray-700">{day}</div>
        ))}
        {renderCalendarGrid()}
      </div>
    </div>
  );
};

export default AdminScheduleCalendar;
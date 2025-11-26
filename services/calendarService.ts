import { Booking, Driver, Bus, Contact } from '../types';

/**
 * Formats a JavaScript Date object into the UTC string format required by the iCalendar spec.
 * Example: 20251030T190000Z
 * @param date The date to format.
 * @returns A string representation of the date in ICS format.
 */
const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
};

/**
 * Generates an iCalendar (.ics) file content string for a given driver's confirmed bookings.
 * This string can be saved as a .ics file and imported into any standard calendar application.
 *
 * @param driver The driver for whom the calendar is being generated.
 * @param bookings An array of all bookings assigned to the driver.
 * @param buses An array of all available buses to look up bus names.
 * @param contacts An array of all contacts to look up client names.
 * @returns A string containing the full .ics file content.
 */
export const generateICS = (driver: Driver, bookings: Booking[], buses: Bus[], contacts: Contact[]): string => {
  const busMap = new Map(buses.map(bus => [bus.id, bus]));
  // Fix: Create a map of contacts to look up client names by contactId.
  const contactMap = new Map(contacts.map(contact => [contact.id, contact]));

  let icsString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//MidnightMadness//Driver Schedule//EN`,
    `X-WR-CALNAME:${driver.name}'s Schedule`,
    'X-WR-TIMEZONE:UTC',
    'CALSCALE:GREGORIAN',
  ];

  bookings.forEach(booking => {
    const bus = busMap.get(booking.busId);
    // Fix: Look up the contact for the booking to get the client's name.
    const contact = contactMap.get(booking.contactId);
    const clientName = contact?.name || 'Unknown Client';
    const event = [
      'BEGIN:VEVENT',
      `UID:${booking.id}@midnightmadness.app`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(booking.startTime)}`,
      `DTEND:${formatICSDate(booking.endTime)}`,
      // Fix: Use the retrieved clientName instead of booking.clientName.
      `SUMMARY:Party Bus Duty: ${clientName}`,
      `LOCATION:Pickup: ${booking.pickupLocation} | Dropoff: ${booking.dropoffLocation}`,
      // Using \\n for newlines in ICS description
      // Fix: Use the retrieved clientName instead of booking.clientName.
      `DESCRIPTION:Client: ${clientName}\\nPassengers: ${booking.passengerCount}\\nBus: ${bus?.name || 'Unknown'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ];
    icsString.push(...event);
  });

  icsString.push('END:VCALENDAR');

  return icsString.join('\r\n');
};

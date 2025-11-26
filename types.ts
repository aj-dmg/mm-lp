export interface Bus {
  id: string;
  name: string;
  capacity: number;
  imageUrl: string;
  features: string[];
  startingPrice: number;
  color: string;
  status?: 'active' | 'maintenance' | 'inactive';
  notes?: string;
}

export interface Driver {
  id:string;
  name: string;
  imageUrl: string;
  phone?: string;
  email?: string;
  googleCalendarId?: string;
  status?: 'active' | 'on_leave' | 'inactive';
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string; // Denormalized for easy display
  corporateClientId?: string; // Link to the corporate client
  source?: string; // Lead source, etc.
  notes?: string; // Internal notes
}

export interface Booking {
  id: string;
  busId: string;
  driverId?: string;
  contactId: string;
  startTime: Date;
  endTime: Date;
  pickupLocation: string;
  dropoffLocation: string;
  passengerCount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  calendarEventId?: string;
  corporateClientId?: string;
  // Business management fields
  quoteAmount?: number;
  paymentStatus?: 'unpaid' | 'deposit_paid' | 'paid_in_full' | 'refunded';
  occasion?: string; // e.g., Wedding, Corporate, Birthday
  bookingSource?: 'web_quote' | 'partner_portal' | 'admin_manual' | 'other';
  notes?: string; // Internal notes for the booking
}

export interface CorporateClient {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  logoUrl?: string;
  defaultPickupLocation: string;
  defaultDropoffLocation: string;
  status?: 'active' | 'inactive';
  notes?: string;
}
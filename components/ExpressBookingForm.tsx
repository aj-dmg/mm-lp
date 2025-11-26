import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';

interface ExpressBookingFormProps {
  onClose: () => void;
}

type BookingState = 'form' | 'processing' | 'confirmed' | 'error';

const ExpressBookingForm: React.FC<ExpressBookingFormProps> = ({ onClose }) => {
  const { bookings } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventDate: '',
    pickupTime: '19:00',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [bookingState, setBookingState] = useState<BookingState>('form');

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.phone) newErrors.phone = 'Phone number is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid.';
    if (!formData.eventDate) {
        newErrors.eventDate = 'Event date is required.';
    } else {
        const selectedDate = new Date(`${formData.eventDate}T${formData.pickupTime}`);
        const twentyFourHoursFromNow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        if (selectedDate < twentyFourHoursFromNow) {
            newErrors.eventDate = "Bookings must be made at least 24 hours in advance.";
        }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = (durationHours: number): boolean => {
    // In static mode, we skip real conflict checks against a database,
    // but we can check against the static 'bookings' array if it had data.
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSquarePayClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!validate() || !checkAvailability(1)) {
        return; // Validation failed
    }
    
    setBookingState('processing');

    // Simulate API process
    setTimeout(() => {
        setBookingState('confirmed');
        // Mock opening square link
        window.open('https://square.link/u/ZWRQGYwR', '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  const handlePaymentClick = (paymentType: string) => {
      if (validate() && checkAvailability(6)) { // 6-hour package
          alert(`This payment flow is not yet connected. \nDetails:\nName: ${formData.name}\nDate: ${formData.eventDate}`);
      }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1001] p-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-deep-midnight-blue text-2xl" aria-label="Close">&times;</button>
        
        <div className="text-center mb-6">
            <h2 className="font-headline font-bold text-deep-midnight-blue text-[clamp(1.75rem,4vw,2.5rem)] leading-tight">Express Booking</h2>
            <p className="font-sans font-semibold text-lg text-hot-pink">15-45 Party Bus</p>
        </div>

        {bookingState === 'form' && (
            <>
                {errors.availability && <p className="text-red-500 text-sm text-center mb-4 bg-red-100 p-3 rounded-lg">{errors.availability}</p>}
                <div className="space-y-4 mb-8">
                    {/* Form fields... */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="name" className="font-sans font-semibold text-deep-midnight-blue mb-1 block">Your Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border-2 border-light-gray focus:border-electric-blue transition-colors bg-white text-charcoal-gray" />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="font-sans font-semibold text-deep-midnight-blue mb-1 block">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border-2 border-light-gray focus:border-electric-blue transition-colors bg-white text-charcoal-gray" />
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="font-sans font-semibold text-deep-midnight-blue mb-1 block">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border-2 border-light-gray focus:border-electric-blue transition-colors bg-white text-charcoal-gray" />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="eventDate" className="font-sans font-semibold text-deep-midnight-blue mb-1 block">Event Date</label>
                            <input type="date" id="eventDate" name="eventDate" value={formData.eventDate} onChange={handleChange} min={today} className="w-full h-12 px-4 rounded-lg border-2 border-light-gray focus:border-electric-blue transition-colors bg-white text-charcoal-gray" style={{colorScheme: 'light'}}/>
                            {errors.eventDate && <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>}
                        </div>
                        <div>
                            <label htmlFor="pickupTime" className="font-sans font-semibold text-deep-midnight-blue mb-1 block">Pickup Time</label>
                            <input type="time" id="pickupTime" name="pickupTime" value={formData.pickupTime} onChange={handleChange} className="w-full h-12 px-4 rounded-lg border-2 border-light-gray focus:border-electric-blue transition-colors bg-white text-charcoal-gray" style={{colorScheme: 'light'}} />
                        </div>
                    </div>
                </div>
                <div className="text-center border-t-2 border-light-gray pt-6">
                    <h3 className="font-headline font-bold text-deep-midnight-blue text-xl mb-4">Pay in Full to Secure Your Booking</h3>
                    <p className="text-sm text-charcoal-gray mb-6 max-w-md mx-auto">Please fill out your details above first. Clicking a button below will proceed to a secure Square checkout.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
                        {/* 1-Hour Payment Button */}
                        <div className="flex flex-col items-center justify-center">
                            <a 
                              href="https://square.link/u/ZWRQGYwR" 
                              onClick={handleSquarePayClick}
                              className="w-[259px] h-[150px] p-4 flex flex-col justify-center items-center bg-white border-2 border-electric-blue rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all"
                            >
                                <span className="font-headline font-bold text-lg text-electric-blue">Pay Deposit Now</span>
                                <span className="text-xs font-sans text-charcoal-gray">(1-Hour Package)</span>
                                <span className="font-headline font-bold text-2xl text-deep-midnight-blue mt-2">$300.00</span>
                            </a>
                        </div>
                        {/* 6-Hour Payment Button */}
                        <button 
                            onClick={() => handlePaymentClick('Pay 6 Hours in Full')}
                            className="w-[259px] h-[150px] p-4 bg-gradient-to-r from-neon-purple to-hot-pink text-white font-headline font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-px transition-all flex flex-col justify-center items-center"
                        >
                            <span className="text-lg">Pay in Full</span>
                            <span className="text-xs font-sans font-normal">(6 Hours)</span>
                        </button>
                    </div>
                </div>
            </>
        )}
        
        {bookingState === 'processing' && (
            <div className="text-center p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-electric-blue mx-auto mb-6"></div>
                <h3 className="font-headline font-bold text-2xl text-deep-midnight-blue mb-4">Finalizing Your Booking...</h3>
                <p className="text-charcoal-gray">Please complete your payment in the new browser tab. This window will automatically update once we receive confirmation.</p>
            </div>
        )}

        {bookingState === 'confirmed' && (
            <div className="text-center p-8">
                <i className="fas fa-check-circle text-green-500 text-6xl mb-6"></i>
                <h3 className="font-headline font-bold text-2xl text-deep-midnight-blue mb-4">Booking Confirmed!</h3>
                <p className="text-charcoal-gray mb-6">Thank you, {formData.name}! Your payment was successful and your booking is secure. You will receive a confirmation email and receipt shortly.</p>
                <button onClick={onClose} className="px-8 py-3 bg-deep-midnight-blue text-white font-headline font-bold rounded-lg hover:bg-opacity-80 transition-all">Close</button>
            </div>
        )}

        {bookingState === 'error' && (
            <div className="text-center p-8">
                <i className="fas fa-times-circle text-red-500 text-6xl mb-6"></i>
                <h3 className="font-headline font-bold text-2xl text-deep-midnight-blue mb-4">An Error Occurred</h3>
                <p className="text-charcoal-gray mb-6">{errors.submit || "We couldn't process your request. Please try again or contact us directly."}</p>
                <button onClick={() => setBookingState('form')} className="px-8 py-3 bg-deep-midnight-blue text-white font-headline font-bold rounded-lg hover:bg-opacity-80 transition-all">Try Again</button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ExpressBookingForm;
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Bus } from '../types';
import { toTitleCase } from '../utils';

interface ExpressPortalPageProps {
    clientSlug: string;
}

const ExpressPortalPage: React.FC<ExpressPortalPageProps> = ({ clientSlug }) => {
    const { corporateClients, buses, createBooking, loading } = useData();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        passengerCount: '' as number | '',
        date: '',
        time: '21:00', // Default 9:00 PM for Cowboys
        duration: 4,
        busId: 'bus-1', // Default selected bus
        pickupLocation: '', 
        dropoffLocation: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const client = useMemo(() => corporateClients.find(c => c.slug === clientSlug), [corporateClients, clientSlug]);

    useEffect(() => {
        if (client) {
            setFormData(prev => ({
                ...prev,
                pickupLocation: client.defaultPickupLocation,
                dropoffLocation: client.defaultDropoffLocation,
            }));
        }
    }, [client]);
    
    const availableBusIds = ['bus-1', 'bus-2', 'bus-4'];
    const availableBuses = useMemo(() => {
        if (!buses || buses.length === 0) return [];
        const busMap = new Map(buses.map(b => [b.id, b]));
        return availableBusIds.map(id => busMap.get(id)).filter((bus): bus is Bus => !!bus);
    }, [buses]);

    const selectedBus = useMemo(() => buses.find(b => b.id === formData.busId), [buses, formData.busId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBusSelect = (busId: string) => {
        setFormData(prev => ({ ...prev, busId, passengerCount: '' })); // Reset passenger count on bus change
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !selectedBus) return;
        if (!formData.name || !formData.email || !formData.phone || !formData.passengerCount || !formData.date || !formData.time || !formData.pickupLocation || !formData.dropoffLocation) {
            setError('Please fill out all fields.');
            return;
        }
        if (Number(formData.passengerCount) > selectedBus.capacity) {
            setError(`Passenger count cannot exceed bus capacity of ${selectedBus.capacity}.`);
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
                busId: formData.busId,
                startTime,
                endTime,
                pickupLocation: toTitleCase(formData.pickupLocation),
                dropoffLocation: toTitleCase(formData.dropoffLocation),
                passengerCount: Number(formData.passengerCount),
                corporateClientId: client.id,
                bookingSource: 'partner_portal' as const,
                occasion: 'Partner Booking',
            };
            
            const corporateInfo = { id: client.id, name: client.name };

            await createBooking(bookingDetails, contactDetails, corporateInfo);
            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-light-gray flex items-center justify-center"><div className="text-xl font-semibold">Loading...</div></div>;
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center text-center p-5">
                <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
                <h1 className="text-3xl font-bold text-deep-midnight-blue mb-2">Customer Not Found</h1>
                <p className="text-charcoal-gray text-lg">The specified customer booking page does not exist.</p>
                <a href="/" className="mt-6 px-6 py-3 bg-deep-midnight-blue text-white font-headline font-bold rounded-lg hover:bg-opacity-80 transition-all">Go to Homepage</a>
            </div>
        );
    }
    
    const today = new Date().toISOString().split("T")[0];
    const inputClasses = "mt-1 block w-full bg-white text-charcoal-gray border-gray-300 rounded-md shadow-sm focus:ring-hot-pink focus:border-hot-pink";

    return (
        <div className="bg-light-gray min-h-screen font-sans">
            <header className="bg-deep-midnight-blue shadow-md">
                 <div className="max-w-5xl mx-auto px-5 md:px-10 h-[70px] flex justify-between items-center">
                    <a href="/">
                        <img src="https://storage.googleapis.com/mm-react-app-videos-photos/Midnight_Madness_logo_white.png" alt="Midnight Madness Logo" className="w-[150px]" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'}} />
                    </a>
                </div>
            </header>
            
            <main className="max-w-3xl mx-auto p-5 md:p-10">
                 <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        {client.logoUrl && (
                            <img src={client.logoUrl} alt={`${client.name} Logo`} className="mx-auto h-24 mb-6 object-contain" />
                        )}
                        <h1 className="font-headline font-bold text-deep-midnight-blue text-[clamp(1.75rem,4vw,2.5rem)]">{client.name} Booking Page</h1>
                    </div>
                     {isSuccess ? (
                        <div className="text-center p-8 bg-green-50 rounded-lg animate-fade-in-up">
                            <h3 className="text-2xl font-bold text-green-800 mb-4">Request Sent!</h3>
                            <p className="text-green-700">Thank you for your booking request. Our team will review the availability and get back to you shortly to confirm the details.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Your Ride</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {availableBuses.map(bus => (
                                        <div 
                                            key={bus.id}
                                            onClick={() => handleBusSelect(bus.id)}
                                            className={`relative p-2 border-2 rounded-lg cursor-pointer transition-all ${formData.busId === bus.id ? 'border-hot-pink shadow-lg' : 'border-gray-300'}`}
                                        >
                                            <img src={bus.imageUrl} alt={bus.name} className="w-full h-20 object-cover rounded-md mb-2"/>
                                            <p className="text-center font-semibold text-xs text-charcoal-gray">{bus.name}</p>
                                            <p className="text-center text-xs text-gray-500">Up to {bus.capacity} guests</p>
                                            {formData.busId === bus.id && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-hot-pink rounded-full flex items-center justify-center text-white shadow">
                                                    <i className="fas fa-check text-xs"></i>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                                <input type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required className={inputClasses} />
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700">Drop-off Location</label>
                                <input type="text" name="dropoffLocation" value={formData.dropoffLocation} onChange={handleChange} required className={inputClasses} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700">Number of Passengers (Max: {selectedBus?.capacity})</label>
                                <input type="number" name="passengerCount" value={formData.passengerCount} onChange={handleChange} max={selectedBus?.capacity} min="1" required className={inputClasses} />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={inputClasses} />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700">Desired Date</label>
                                <input type="date" name="date" value={formData.date} min={today} onChange={handleChange} required className={inputClasses} style={{colorScheme: 'light'}} />
                                </div>
                                <div>
                                <label className="block text-sm font-medium text-gray-700">Pick-up Time</label>
                                <input type="time" name="time" value={formData.time} onChange={handleChange} required className={inputClasses} style={{colorScheme: 'light'}} />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-hot-pink text-white font-headline font-bold rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                                </button>
                            </div>
                        </form>
                    )}
                 </div>
            </main>
            <footer className="text-center py-6">
                <p className="text-steel-gray text-sm">&copy; {new Date().getFullYear()} Midnight Madness Party Bus & Coaches.</p>
            </footer>
        </div>
    );
};

export default ExpressPortalPage;
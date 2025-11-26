import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Booking, Bus, Driver, Contact } from '../types';
import { suggestItinerary } from '../services/geminiService';

interface PortalPageProps {
    bookingId: string;
    onAdminLoginClick: () => void;
}

const PortalPage: React.FC<PortalPageProps> = ({ bookingId, onAdminLoginClick }) => {
    const { bookings, buses, drivers, contacts, loading } = useData();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [bus, setBus] = useState<Bus | null>(null);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [contact, setContact] = useState<Contact | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [itinerary, setItinerary] = useState('');
    const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);

    useEffect(() => {
        if (!loading) {
            const foundBooking = bookings.find(b => b.id === bookingId);
            if (foundBooking) {
                setBooking(foundBooking);
                setBus(buses.find(b => b.id === foundBooking.busId) || null);
                setDriver(foundBooking.driverId ? drivers.find(d => d.id === foundBooking.driverId) : null);
                setContact(contacts.find(c => c.id === foundBooking.contactId) || null);
            } else {
                setError('Booking not found. Please check the link and try again.');
            }
        }
    }, [bookingId, loading, bookings, buses, drivers, contacts]);
    
    const handleGenerateItinerary = async () => {
        if(!booking) return;
        setIsGeneratingItinerary(true);
        setItinerary('');
        try {
            const duration = (booking.endTime.getTime() - booking.startTime.getTime()) / 3600000;
            const suggestion = await suggestItinerary({
                pickup: booking.pickupLocation,
                dropoff: booking.dropoffLocation,
                passengers: booking.passengerCount,
                hours: Math.round(duration)
            });
            setItinerary(suggestion);
        } catch (err) {
            setItinerary("Failed to generate itinerary.");
        } finally {
            setIsGeneratingItinerary(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-light-gray flex items-center justify-center"><div className="text-xl font-semibold">Loading Booking Details...</div></div>;
    }
    
    if (error) {
         return (
            <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center text-center p-5">
                <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
                <h1 className="text-3xl font-bold text-deep-midnight-blue mb-2">Oops!</h1>
                <p className="text-charcoal-gray text-lg">{error}</p>
                <a href="/" className="mt-6 px-6 py-3 bg-deep-midnight-blue text-white font-headline font-bold rounded-lg hover:bg-opacity-80 transition-all">Go to Homepage</a>
            </div>
        );
    }
    
    if (!booking || !contact) {
        return null; // Should be covered by error state
    }
    
    const getStatusInfo = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return { text: 'Confirmed', color: 'bg-green-100 text-green-800' };
            case 'pending': return { text: 'Pending Confirmation', color: 'bg-yellow-100 text-yellow-800' };
            case 'cancelled': return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
        }
    };

    const statusInfo = getStatusInfo(booking.status);

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="bg-light-gray min-h-screen font-sans">
            <header className="bg-deep-midnight-blue shadow-md">
                 <div className="max-w-5xl mx-auto px-5 md:px-10 h-[70px] flex justify-between items-center">
                    <a href="/">
                        <img src="https://storage.googleapis.com/mm-react-app-videos-photos/Midnight_Madness_logo_white.png" alt="Midnight Madness Logo" className="w-[150px]" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'}} />
                    </a>
                </div>
            </header>
            
            <main className="max-w-5xl mx-auto p-5 md:p-10">
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 border-b border-light-gray pb-6">
                        <div>
                            <h1 className="font-headline font-bold text-deep-midnight-blue text-[clamp(1.75rem,4vw,2.5rem)]">Your Itinerary</h1>
                            <p className="font-sans text-lg text-charcoal-gray">For {contact.name}'s event</p>
                        </div>
                        <div className={`px-4 py-2 text-sm font-semibold rounded-full ${statusInfo.color} self-start mt-2 sm:mt-0`}>{statusInfo.text}</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Itinerary Details */}
                        <div className="space-y-6">
                            <h2 className="font-headline font-bold text-xl text-deep-midnight-blue border-b-2 border-electric-blue pb-2">Trip Details</h2>
                            <div className="flex items-start gap-4">
                                <i className="fas fa-calendar-alt text-electric-blue text-2xl w-8 text-center mt-1"></i>
                                <div>
                                    <p className="font-semibold">Date</p>
                                    <p className="text-charcoal-gray">{formatDate(booking.startTime)}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <i className="fas fa-clock text-electric-blue text-2xl w-8 text-center mt-1"></i>
                                <div>
                                    <p className="font-semibold">Time</p>
                                    <p className="text-charcoal-gray">{formatTime(booking.startTime)} to {formatTime(booking.endTime)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <i className="fas fa-map-marker-alt text-electric-blue text-2xl w-8 text-center mt-1"></i>
                                <div>
                                    <p className="font-semibold">Pickup Location</p>
                                    <p className="text-charcoal-gray">{booking.pickupLocation}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <i className="fas fa-flag-checkered text-electric-blue text-2xl w-8 text-center mt-1"></i>
                                <div>
                                    <p className="font-semibold">Drop-off Location</p>
                                    <p className="text-charcoal-gray">{booking.dropoffLocation}</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <i className="fas fa-users text-electric-blue text-2xl w-8 text-center mt-1"></i>
                                <div>
                                    <p className="font-semibold">Passengers</p>
                                    <p className="text-charcoal-gray">{booking.passengerCount}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bus & Driver */}
                        <div className="space-y-8">
                            {bus && (
                                <div>
                                    <h2 className="font-headline font-bold text-xl text-deep-midnight-blue border-b-2 border-electric-blue pb-2 mb-4">Your Ride</h2>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <img src={bus.imageUrl} alt={bus.name} className="w-full sm:w-40 h-auto object-cover rounded-lg shadow-md" />
                                        <div>
                                            <h3 className="font-semibold text-lg">{bus.name}</h3>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {bus.features.map(f => <span key={f} className="text-xs bg-light-gray text-charcoal-gray px-2 py-1 rounded-full">{f}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {driver && booking.status === 'confirmed' && (
                                <div>
                                    <h2 className="font-headline font-bold text-xl text-deep-midnight-blue border-b-2 border-electric-blue pb-2 mb-4">Your Driver</h2>
                                    <div className="flex items-center gap-4">
                                        <img src={driver.imageUrl} alt={driver.name} className="w-20 h-20 object-cover rounded-full shadow-md" />
                                        <div>
                                            <h3 className="font-semibold text-lg">{driver.name}</h3>
                                            {driver.phone && <a href={`tel:${driver.phone}`} className="text-electric-blue hover:underline">{driver.phone}</a>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                     <div className="mt-10 border-t border-light-gray pt-6">
                        <h2 className="font-headline font-bold text-xl text-deep-midnight-blue mb-4">Need Some Ideas?</h2>
                        <button onClick={handleGenerateItinerary} disabled={isGeneratingItinerary || booking.status !== 'confirmed'} className="w-full sm:w-auto flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-neon-purple to-hot-pink hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hot-pink disabled:opacity-50 disabled:cursor-not-allowed">
                            {isGeneratingItinerary ? 'Thinking...' : '✨ Suggest an Itinerary with AI'}
                        </button>
                        {itinerary && (
                            <div className="mt-4 p-4 bg-light-gray rounded-md animate-fade-in-up">
                                <pre className="whitespace-pre-wrap font-sans text-charcoal-gray">{itinerary}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </main>
             <footer className="text-center py-6">
                <p className="text-steel-gray text-sm">&copy; {new Date().getFullYear()} Midnight Madness Party Bus & Coaches.</p>
                <button onClick={onAdminLoginClick} className="text-steel-gray text-sm hover:text-electric-blue transition-colors">Admin Login</button>
            </footer>
        </div>
    );
};

export default PortalPage;

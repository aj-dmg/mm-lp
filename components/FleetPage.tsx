
import React, { useEffect } from 'react';
import { StickyNav, Footer } from './LandingPage.tsx';

interface VirtualTourProps {
    tourUrl: string;
    title: string;
}

/**
 * VirtualTourEmbed
 * Uses a direct iframe for maximum reliability in a React environment.
 * Includes all necessary permissions for 360/VR features.
 */
const VirtualTourEmbed: React.FC<VirtualTourProps> = ({ tourUrl, title }) => {
    return (
        <div className="w-full h-[500px] md:h-[700px] rounded-xl overflow-hidden shadow-2xl bg-charcoal-gray relative">
            {/* Loading placeholder spinner - stays behind the iframe while it loads */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 pointer-events-none z-0">
                <i className="fas fa-circle-notch animate-spin text-4xl mb-3"></i>
                <span className="text-sm font-sans uppercase tracking-widest">Loading 360° Tour</span>
            </div>
            
            <iframe
                src={tourUrl}
                title={title}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                className="relative z-10 w-full h-full border-none"
            ></iframe>
        </div>
    );
};

const FleetPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const featuresDoubleDecker = ['85 Passenger Capacity', 'Premium Sound System', 'Laser & LED Lighting', 'On-Board Dance Floor'];
    const featuresPartyBus = ['15-45 Passenger Capacity', 'Limo Style Seating', 'Bluetooth Audio Connectivity', 'Mood Lighting'];

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            <StickyNav forceSolidBackground={true} />
            
            <main className="flex-grow pt-[100px] pb-20">
                <section className="max-w-[1200px] mx-auto px-5 md:px-10 mb-20">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h1 className="font-headline font-bold text-deep-midnight-blue text-[clamp(2.5rem,5vw,4rem)] mb-4 uppercase tracking-tight">The Midnight Fleet</h1>
                        <p className="font-sans text-xl text-charcoal-gray max-w-3xl mx-auto">
                            Step inside and explore our premium rides. Use your mouse or move your phone to experience the atmosphere.
                        </p>
                    </div>

                    {/* Double Decker Section */}
                    <div className="mb-24 scroll-animate animate-fade-in-up">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="font-headline font-bold text-3xl text-deep-midnight-blue border-l-4 border-neon-purple pl-4 uppercase tracking-wide">Double-Decker Party Bus</h2>
                                <p className="text-steel-gray mt-2 pl-5 italic">Calgary's only true 85-passenger mobile venue.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {featuresDoubleDecker.map((feature, i) => (
                                    <span key={i} className="px-3 py-1 bg-light-gray rounded-md text-deep-midnight-blue text-xs font-bold uppercase">{feature}</span>
                                ))}
                            </div>
                        </div>
                        
                        <VirtualTourEmbed 
                            tourUrl="https://teliportme.com/embed/tour/4d50c608" 
                            title="Double Decker 360 Virtual Tour"
                        />
                    </div>

                    {/* 15-45 Party Bus Section */}
                    <div className="scroll-animate animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="font-headline font-bold text-3xl text-deep-midnight-blue border-l-4 border-electric-blue pl-4 uppercase tracking-wide">15-45 Passenger Party Bus</h2>
                                <p className="text-steel-gray mt-2 pl-5 italic">Luxury, intimacy, and non-stop energy for your crew.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {featuresPartyBus.map((feature, i) => (
                                    <span key={i} className="px-3 py-1 bg-light-gray rounded-md text-deep-midnight-blue text-xs font-bold uppercase">{feature}</span>
                                ))}
                            </div>
                        </div>
                        
                        <VirtualTourEmbed 
                            tourUrl="https://teliportme.com/embed/tour/4a5200b2" 
                            title="Party Bus 360 Virtual Tour"
                        />
                    </div>
                </section>

                <section className="bg-deep-midnight-blue py-20">
                     <div className="max-w-[800px] mx-auto text-center px-5">
                        <h2 className="font-headline font-bold text-white text-3xl mb-4 uppercase tracking-tight">Ready to Turn the Lights On?</h2>
                        <p className="text-metallic-silver mb-10 text-lg">Our dates fill up fast—especially during peak season.</p>
                        
                        <a 
                            href="https://book.mylimobiz.com/v4/midnightmadness" 
                            data-ores-widget="website" 
                            data-ores-alias="midnightmadness"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-neon-purple to-hot-pink text-white font-headline font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg inline-block cursor-pointer uppercase tracking-widest"
                        >
                            Online Reservations
                        </a>
                        
                        <p className="text-white/40 text-xs mt-4 uppercase tracking-widest">Instant Booking & Real-Time Availability</p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default FleetPage;

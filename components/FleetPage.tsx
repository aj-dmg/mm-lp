import React, { useEffect, useRef } from 'react';
import { StickyNav, Footer } from './LandingPage.tsx';

interface TeliportMeEmbedProps {
    url: string;
}

const TeliportMeEmbed: React.FC<TeliportMeEmbedProps> = React.memo(({ url }) => {
    // Using iframe directly is more robust for React than injecting scripts that modify DOM
    return (
        <div className="w-full h-[500px] md:h-[700px] rounded-xl overflow-hidden shadow-2xl bg-charcoal-gray">
            <iframe 
                src={url} 
                className="w-full h-full border-0" 
                allowFullScreen 
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                title="Virtual Tour"
            />
        </div>
    );
});

const FleetPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const featuresDoubleDecker = ['85 Passenger Capacity', 'Premium Sound', 'Laser Lights', 'Dance Floor'];
    const featuresPartyBus = ['45 Passenger Capacity', 'Limo Seating', 'Bluetooth Audio', 'LED Mood Lighting'];

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <StickyNav forceSolidBackground={true} />
            
            <main className="flex-grow pt-[100px] pb-20">
                <section className="max-w-[1200px] mx-auto px-5 md:px-10 mb-20">
                    <div className="text-center mb-12">
                        <h1 className="font-headline font-bold text-deep-midnight-blue text-[clamp(2.5rem,5vw,4rem)] mb-4">Our Buses</h1>
                        <p className="font-sans text-xl text-charcoal-gray max-w-3xl mx-auto">Experience the ultimate party atmosphere before you even book.</p>
                    </div>

                    {/* Double Decker Section */}
                    <div className="mb-24">
                        <h2 className="font-headline font-bold text-3xl text-deep-midnight-blue mb-6 border-l-4 border-neon-purple pl-4">Double-Decker Party Bus</h2>
                        <div className="relative">
                            <TeliportMeEmbed url="https://teliportme.com/embed/tour/4a5200b2" />
                        </div>
                         <div className="mt-6 flex flex-wrap gap-4 justify-center">
                            {featuresDoubleDecker.map((feature, i) => (
                                <span key={i} className="px-4 py-2 bg-light-gray rounded-full text-charcoal-gray text-sm font-semibold">{feature}</span>
                            ))}
                        </div>
                    </div>

                    {/* 15-45 Party Bus Section */}
                    <div>
                        <h2 className="font-headline font-bold text-3xl text-deep-midnight-blue mb-6 border-l-4 border-electric-blue pl-4">15-45 Party Bus</h2>
                        <div className="relative">
                             <TeliportMeEmbed url="https://teliportme.com/embed/tour/4a5200b2" />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                            {featuresPartyBus.map((feature, i) => (
                                <span key={i} className="px-4 py-2 bg-light-gray rounded-full text-charcoal-gray text-sm font-semibold">{feature}</span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-deep-midnight-blue py-16">
                     <div className="max-w-[800px] mx-auto text-center px-5">
                        <h2 className="font-headline font-bold text-white text-3xl mb-6">Seen Enough? Let's Get This Party Started.</h2>
                         <button 
                            onClick={() => window.location.href = '/#quote'}
                            className="bg-electric-blue text-white font-headline font-bold py-4 px-10 rounded-lg shadow-lg hover:bg-opacity-90 transform hover:-translate-y-1 transition-all duration-300 text-lg"
                        >
                            Book Your Ride Now
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default FleetPage;
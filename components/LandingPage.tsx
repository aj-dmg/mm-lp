import React, { useState, useEffect, useRef } from 'react';

type AudiencePath = 'celebrate' | 'wedding' | 'corporate' | null;

// Custom hook for scroll animations
const useScrollAnimation = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observer.observe(el));

        return () => elements.forEach(el => observer.unobserve(el));
    }, []);
};

// Main LandingPage Component
const LandingPage: React.FC = () => {
    useScrollAnimation();
    const [activePath, setActivePath] = useState<AudiencePath>(null);
    
    const audiencePathSectionRef = useRef<HTMLElement>(null);
    const quoteFormSectionRef = useRef<HTMLElement>(null);
    const fleetSectionRef = useRef<HTMLElement>(null);
    const eventsSectionRef = useRef<HTMLElement>(null);
    const aboutSectionRef = useRef<HTMLElement>(null);

    const sectionRefs = {
        fleet: fleetSectionRef,
        events: eventsSectionRef,
        about: aboutSectionRef,
        quote: quoteFormSectionRef,
    };

    useEffect(() => {
        // Load the external booking widget script globally for the page
        const script = document.createElement('script');
        script.src = "https://book.mylimobiz.com/v4/widgets/widget-loader.js";
        script.type = "text/javascript";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if(document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);
    
    const handleAudienceSelect = (path: AudiencePath) => {
        setActivePath(path);
        setTimeout(() => {
            audiencePathSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleScrollToQuote = () => {
        quoteFormSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <div className="bg-white">
            <StickyNav sectionRefs={sectionRefs} onBookNowClick={handleScrollToQuote} />
            <main>
                <HeroSection onBookNowClick={handleScrollToQuote} />
                <ProblemAwarenessSection ref={aboutSectionRef} />
                <TrustSignalsBar />
                <AudiencePathsSection ref={audiencePathSectionRef} activePath={activePath} onExplore={handleScrollToQuote} />
                <DoubleDeckerSection ref={fleetSectionRef} />
                <HowItWorksSection ref={eventsSectionRef} />
                <FaqSection />
                <section ref={quoteFormSectionRef} className="bg-light-gray py-20 md:py-32">
                    <div className="max-w-[800px] mx-auto text-center px-5">
                         <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl scroll-animate">
                            <h2 className="font-headline font-bold text-center text-deep-midnight-blue text-[clamp(1.75rem,3.5vw,2.5rem)] mb-8">Ready to Lock In Your Legendary Night</h2>
                            <div className="flex justify-center">
                                <a 
                                    href="https://book.mylimobiz.com/v4/midnightmadness" 
                                    data-ores-widget="website" 
                                    data-ores-alias="midnightmadness"
                                    className="bg-gradient-to-r from-neon-purple to-hot-pink text-white font-headline font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg inline-block cursor-pointer"
                                >
                                    Online Reservations
                                </a>
                            </div>
                            <p className="font-sans text-center text-charcoal-gray/90 text-sm mt-6">(For groups of 15-45 who are ready to roll)</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer sectionRefs={sectionRefs} />
        </div>
    );
};

// All sub-components are defined below to keep them within this file.

interface NavProps {
    sectionRefs: { [key: string]: React.RefObject<HTMLElement> };
    onBookNowClick: () => void;
}

const StickyNav: React.FC<NavProps> = ({ sectionRefs, onBookNowClick }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
        setIsMenuOpen(false);
        const offset = 80; // height of nav
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = ref.current?.getBoundingClientRect().top ?? 0;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };
    
    const navItems = [
        { name: 'Fleet', ref: sectionRefs.fleet },
        { name: 'Events', ref: sectionRefs.events },
        { name: 'About', ref: sectionRefs.about },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${isScrolled ? 'h-[70px] bg-deep-midnight-blue/95 shadow-lg backdrop-blur-md' : 'h-[80px] bg-transparent'}`}>
            <div className="max-w-[1200px] mx-auto px-5 md:px-10 h-full flex justify-between items-center">
                <a href="#hero" className="flex-shrink-0">
                    <img src="https://storage.googleapis.com/mm-react-app-videos-photos/Midnight_Madness_logo_white.png" alt="Midnight Madness Logo" className={`transition-all duration-300 ${isScrolled ? 'w-[120px]' : 'w-[150px]'}`} style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'}} />
                </a>
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map(item => (
                         <button key={item.name} onClick={() => scrollToSection(item.ref)} className="font-sans text-white text-[15px] font-medium hover:text-electric-blue transition-colors relative after:content-[''] after:absolute after:w-full after:h-[2px] after:bottom-0 after:left-0 after:bg-electric-blue after:scale-x-0 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">{item.name}</button>
                    ))}
                </nav>
                <div className="flex items-center gap-4">
                     <button onClick={onBookNowClick} className="hidden md:block bg-electric-blue text-white font-headline font-bold text-sm px-7 py-3 rounded-md hover:bg-opacity-80 transform hover:scale-105 transition-all">
                        Get Started
                    </button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white" aria-label="Toggle menu">
                        <i className="fas fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
             {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-deep-midnight-blue transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden flex flex-col p-5`}>
                 {/* Mobile Menu Header */}
                <div className="flex-shrink-0 grid grid-cols-3 items-center w-full">
                    <div />
                    <h2 className="font-headline text-white text-2xl text-center col-start-2">Menu</h2>
                    <button onClick={() => setIsMenuOpen(false)} className="text-white justify-self-end" aria-label="Close menu">
                        <i className="fas fa-times text-3xl"></i>
                    </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-grow flex flex-col items-center justify-center">
                    <nav className="flex flex-col items-center gap-8">
                         {navItems.map(item => (
                             <button key={item.name} onClick={() => scrollToSection(item.ref)} className="font-sans text-white text-2xl font-medium hover:text-electric-blue transition-colors h-[48px]">{item.name}</button>
                        ))}
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <button onClick={onBookNowClick} className="w-full bg-electric-blue text-white font-headline font-bold text-lg px-8 py-4 rounded-md hover:bg-opacity-80 transform hover:scale-105 transition-all">
                                Get Started
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

interface HeroProps {
    onBookNowClick: () => void;
}

const HeroSection: React.FC<HeroProps> = ({ onBookNowClick }) => {
    const [isTextVisible, setIsTextVisible] = useState(false);

    useEffect(() => {
        // Reduced delay for better UX
        const timer = setTimeout(() => {
            setIsTextVisible(true);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, []);
    
    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center text-white text-center overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
                poster="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            >
                <source src="https://storage.googleapis.com/mm-react-app-videos-photos/MM-Montage-720p-70.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(26,35,126,0.6)] to-[rgba(0,0,0,0.8)]"></div>
            <div className="relative z-10 p-5 flex flex-col items-center w-full">
                <h1 
                    className={`font-headline font-bold text-[clamp(2.5rem,5vw,4rem)] leading-tight text-shadow-lg transition-all duration-700 ease-out ${isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{textShadow: '2px 2px 8px rgba(0,0,0,0.5)', transitionDelay: '0ms'}}
                >
                    Your Event. Your Ride. Unforgettable Memories.
                </h1>
                <p 
                    className={`font-sans font-medium text-[clamp(1.125rem,2.5vw,1.5rem)] text-light-gray max-w-[700px] mt-4 transition-all duration-700 ease-out ${isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{textShadow: '1px 1px 4px rgba(0,0,0,0.5)', transitionDelay: '150ms'}}
                >
                    With Midnight Madness, your travel time is party time. The experience begins the second you and your crew step onboard. 
                </p>
                <p 
                    className={`font-sans text-[clamp(0.875rem,1.5vw,1rem)] text-metallic-silver italic max-w-[600px] mt-3 transition-all duration-700 ease-out ${isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{textShadow: '1px 1px 4px rgba(0,0,0,0.5)', transitionDelay: '300ms'}}
                >
                    Everyone together. Everyone on time. Zero stress. 100% fun.
                </p>
                
                <div 
                    className={`mt-12 w-full max-w-6xl px-4 transition-all duration-700 ease-out ${isTextVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                    style={{ transitionDelay: '500ms' }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                        <button 
                            onClick={onBookNowClick}
                            className="bg-gradient-to-r from-neon-purple to-hot-pink text-white font-headline font-bold py-5 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base uppercase tracking-wider"
                        >
                            Celebrating With Friends?
                        </button>
                        <button 
                            onClick={onBookNowClick}
                            className="bg-gradient-to-r from-blush-pink to-champagne-gold text-deep-midnight-blue font-headline font-bold py-5 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base uppercase tracking-wider"
                        >
                            Coordinating a Wedding?
                        </button>
                        <button 
                            onClick={onBookNowClick}
                            className="bg-gradient-to-r from-navy-blue to-steel-gray text-white font-headline font-bold py-5 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base uppercase tracking-wider"
                        >
                            Managing Corporate Groups?
                        </button>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-10 flex flex-col items-center gap-2 animate-bounce">
                <span className="font-sans text-sm text-white/70">Why Settle For a Standard Night Out?</span>
                <i className="fas fa-arrow-down text-xl"></i>
            </div>
        </section>
    );
};

const ProblemAwarenessSection = React.forwardRef<HTMLElement>((props, ref) => {
    const problems = [
        { icon: 'fa-phone-slash', title: "Forget The Coordination Chaos", text: "Instead of scattered arrivals and endless 'where are you?' texts, your entire group starts the celebration together from the moment they leave the door." },
        { icon: 'fa-calculator', title: "The energy builds on the way to your main event, turning a simple ride into a legendary pre-party.", text: null },
        { icon: 'fa-shield-alt', title: "Everyone arrives at the same time, hyped and ready to go.", text: null },
    ];
    return(
        <section ref={ref} className="bg-light-gray py-20 md:py-32">
            <div className="max-w-[1200px] mx-auto px-5 md:px-10">
                <div className="text-center">
                    <h2 className="font-headline font-bold text-[clamp(2rem,4vw,3rem)] text-deep-midnight-blue mb-6 scroll-animate">Why Settle For a Standard Night Out?</h2>
                    <p className="font-sans text-lg md:text-xl leading-relaxed text-charcoal-gray max-w-4xl mx-auto mb-16 scroll-animate">
                        You're planning something special. The last thing you want is for the night to fizzle out before it even begins.
                        <br/><br/>
                        Picture this instead: Instead of scattered arrivals and endless "where are you?" texts, your entire group starts the celebration together from the moment they leave the door.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 md:gap-10">
                    <div key={0} className="text-center scroll-animate" style={{animationDelay: `0s`}}>
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                            <i className={`fas fa-users text-electric-blue text-4xl`}></i>
                        </div>
                        <h3 className="font-sans font-semibold text-xl text-charcoal-gray mb-4">The energy builds on the way to your main event, turning a simple ride into a legendary pre-party.</h3>
                    </div>
                     <div key={1} className="text-center scroll-animate" style={{animationDelay: `0.1s`}}>
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                            <i className={`fas fa-clock text-electric-blue text-4xl`}></i>
                        </div>
                        <h3 className="font-sans font-semibold text-xl text-charcoal-gray mb-4">Everyone arrives at the same time, hyped and ready to go.</h3>
                    </div>
                     <div key={2} className="text-center scroll-animate" style={{animationDelay: `0.2s`}}>
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                            <i className={`fas fa-shield-alt text-electric-blue text-4xl`}></i>
                        </div>
                        <h3 className="font-sans font-semibold text-xl text-charcoal-gray mb-4">This isn't just about getting from A to B. It's about upgrading the entire experience.</h3>
                    </div>
                </div>
            </div>
        </section>
    );
});


const TrustSignalsBar: React.FC = () => {
    const signals = [
        { icon: 'fa-calendar-alt', value: '10+', text: 'Years Serving Calgary' },
        { icon: 'fa-users', value: '10,000+', text: 'Happy Guests' },
        { icon: 'fa-shield-alt', value: '100%', text: 'Safety Certified' },
        { icon: 'fa-clock', value: '2 Hours', text: 'Response Time' },
        { icon: 'fa-star', value: '4.9/5.0', text: '500+ Reviews' },
    ];
    return (
         <section className="bg-deep-midnight-blue py-10">
            <div className="max-w-[1200px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-5 gap-8">
                 {signals.map((s, i) => (
                    <div key={i} className="text-center flex flex-col items-center scroll-animate" style={{animationDelay: `${i * 0.1}s`}}>
                        <i className={`fas ${s.icon} text-electric-blue text-5xl mb-3`}></i>
                        <p className="font-headline font-bold text-white text-3xl leading-none">{s.value}</p>
                        <p className="font-sans text-sm text-metallic-silver mt-1">{s.text}</p>
                    </div>
                 ))}
            </div>
        </section>
    );
};

const AudiencePathsSection = React.forwardRef<HTMLElement, { activePath: AudiencePath; onExplore: () => void; }>(( { activePath, onExplore }, ref ) => {
    if (!activePath) return null;

    const paths = {
        celebrate: {
            accentColor: 'neon-purple',
            accentGradient: 'from-neon-purple to-hot-pink',
            borderColor: 'border-neon-purple',
            image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            headline: "What Would Your Celebration Look Like If Nobody Had to Worry About Transportation?",
            subheadline: "Imagine this: Everyone shows up. Everyone stays. Everyone gets home safely. No designated drivers missing out. No group texts at 2am asking who's driving.",
            ctaText: "EXPLORE YOUR OPTIONS",
            headlineFont: undefined,
        },
        wedding: {
            accentColor: 'champagne-gold',
            accentGradient: 'from-blush-pink to-champagne-gold',
            borderColor: 'border-champagne-gold',
            headlineFont: 'font-serif',
            image: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            headline: "How Are You Planning to Get 60 Wedding Guests From the Hotel to Your Venue?",
            subheadline: "If your answer is 'I haven't figured that out yet,' you're in the right place.",
            ctaText: "GET A CUSTOM SOLUTION"
        },
        corporate: {
            accentColor: 'navy-blue',
            accentGradient: 'from-navy-blue to-steel-gray',
            borderColor: 'border-navy-blue',
            image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
            headline: "How Do You Transport 50 Employees Without the Liability Headache?",
            subheadline: "If you're coordinating your company's next event, you're probably not excited about the transportation logistics. Let's fix that.",
            ctaText: "DISCUSS YOUR EVENT",
            headlineFont: undefined,
        }
    }
    const currentPath = paths[activePath];

    return (
        <section ref={ref} className={`bg-white py-16 md:py-24 border-t-4 ${currentPath.borderColor} transition-opacity duration-500`}>
            <div className="max-w-[1200px] mx-auto px-5 md:px-10">
                <div className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-12 shadow-2xl">
                    <img src={currentPath.image} alt={currentPath.headline} className="w-full h-full object-cover" />
                </div>
                <h2 className={`${currentPath.headlineFont || 'font-headline'} font-bold text-center text-[clamp(2rem,4vw,2.75rem)] text-deep-midnight-blue max-w-4xl mx-auto mb-6`}>{currentPath.headline}</h2>
                <p className="font-sans text-center text-[clamp(1.125rem,2.5vw,1.375rem)] text-charcoal-gray max-w-3xl mx-auto mb-16">{currentPath.subheadline}</p>

                {/* Simplified content for brevity. A full implementation would have all the specific content per path. */}
                <div className="text-center">
                    <button onClick={onExplore} className={`px-12 py-5 font-headline font-bold text-lg rounded-lg text-white bg-gradient-to-r ${currentPath.accentGradient} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all`}>
                        {currentPath.ctaText}
                    </button>
                </div>
            </div>
        </section>
    );
});


const DoubleDeckerSection = React.forwardRef<HTMLElement>((props, ref) => {
    return (
        <section ref={ref} className="bg-deep-midnight-blue text-white py-20 md:py-32">
            <div className="max-w-[1200px] mx-auto px-5 md:px-10 text-center">
                <h2 className="font-headline font-bold text-[clamp(2rem,4vw,3rem)] mb-6 scroll-animate">Why Calgary's Only Double-Decker Buses Change Everything</h2>
                <p className="font-sans text-metallic-silver text-[clamp(1.125rem,2.5vw,1.5rem)] max-w-3xl mx-auto mb-16 scroll-animate">
                    It's not just transportation. It's the solution to every problem we just discussed.
                </p>
                <div className="bg-white/5 p-8 md:p-12 rounded-xl border border-white/10 backdrop-blur-sm scroll-animate">
                    <p className="font-sans font-semibold text-2xl text-white mb-8">What if there was one solution that:</p>
                    <ul className="text-left max-w-2xl mx-auto space-y-5">
                       {['Eliminates coordination chaos (everyone in one place)', 'Reduces per-person cost below rideshares (50+ capacity)', 'Removes liability concerns (professional commercial driver)', 'Creates Instagram-worthy memories (unique Calgary experience)'].map((item, i) => (
                           <li key={i} className="flex items-start gap-4">
                               <i className="fas fa-check-circle text-electric-blue text-2xl mt-1"></i>
                               <span className="font-sans text-lg">{item}</span>
                           </li>
                       ))}
                    </ul>
                </div>
            </div>
        </section>
    )
});

const HowItWorksSection = React.forwardRef<HTMLElement>((props, ref) => {
    const steps = [
        { icon: 'fa-clipboard-list', title: "Tell Us Your Vision", text: "Fill out our quick form (it only takes 2 minutes!) and tell us about the event you're dreaming up. What’s the occasion? How many people? What would make it perfect?" },
        { icon: 'fa-tasks', title: "Get Your Custom Game Plan", text: "Within hours, he’ll send you a custom proposal built specifically for your group—not a generic quote." },
        { icon: 'fa-handshake', title: "You Make the Call", text: "We’ll send you the plan in writing. If it looks like the perfect solution to kick off your event, we’ll lock in your date. If not, no pressure, no strings attached." },
    ];
    return (
        <section ref={ref} className="bg-white py-20 md:py-32">
            <div className="max-w-[1200px] mx-auto px-5 md:px-10">
                <h2 className="font-headline font-bold text-center text-deep-midnight-blue text-[clamp(2rem,4vw,3rem)] mb-6 scroll-animate">Let's Plan Your Perfect Ride.</h2>
                <p className="font-sans text-center text-charcoal-gray text-[clamp(1.125rem,2.5vw,1.375rem)] max-w-3xl mx-auto mb-20 scroll-animate">
                    Forget high-pressure sales and confusing contracts. Our goal is simple: to help you create an amazing event. Here’s how we do it.
                </p>
                <div className="grid md:grid-cols-3 gap-16 md:gap-10">
                    {steps.map((step, i) => (
                        <div key={i} className="text-center relative pt-5 scroll-animate" style={{animationDelay: `${i * 0.1}s`}}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-electric-blue text-white font-headline font-bold text-xl rounded-full flex items-center justify-center shadow-lg">{i + 1}</div>
                            <div className="w-20 h-20 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-6">
                                <i className={`fas ${step.icon} text-electric-blue text-4xl`}></i>
                            </div>
                            <h3 className="font-headline font-bold text-2xl text-deep-midnight-blue mb-4">{step.title}</h3>
                            <p className="font-sans text-base leading-relaxed">{step.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
});

const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const faqs = [
        { q: "How much does this actually cost?", a: "It depends on your specific situation—date, duration, guest count. Most groups are surprised to find it's less per person than coordinating multiple rideshares. We'll give you exact pricing based on your event, no hidden fees." },
        { q: "What if I don't know my exact guest count yet?", a: "Totally normal. Give us your best estimate. We'll build in flexibility. You're not locked in to exact numbers until closer to your date." },
        { q: "How far in advance do I need to book?", a: "Weekends, especially in summer, book 4-8 weeks out. If your event is sooner, reach out anyway—we occasionally have availability." },
        { q: "Is this going to be a high-pressure sales call?", a: "No. When you submit a request, we send you a written proposal. You can reply via email, call us with questions, or ignore us. We don't do pushy follow-ups. Seriously." },
    ];
    return (
         <section className="bg-white py-20 md:py-32">
            <div className="max-w-[900px] mx-auto px-5 md:px-10">
                <h2 className="font-headline font-bold text-center text-deep-midnight-blue text-[clamp(2rem,4vw,2.75rem)] mb-16 scroll-animate">Questions You Probably Have</h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                         <div key={i} className="border-2 border-light-gray rounded-lg overflow-hidden scroll-animate" style={{animationDelay: `${i * 0.1}s`}}>
                            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex justify-between items-center p-6 text-left hover:bg-light-gray transition-colors">
                                <h3 className="font-sans font-semibold text-lg text-deep-midnight-blue">{faq.q}</h3>
                                <i className={`fas fa-plus text-electric-blue transition-transform duration-300 ${openIndex === i ? 'rotate-45' : ''}`}></i>
                            </button>
                            <div className={`transition-all duration-300 ease-in-out grid ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                     <p className="px-6 pb-6 font-sans text-base leading-relaxed text-charcoal-gray">{faq.a}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
};


const Footer: React.FC<Pick<NavProps, 'sectionRefs'>> = ({sectionRefs}) => {
     const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = ref.current?.getBoundingClientRect().top ?? 0;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };
    return (
         <footer className="bg-charcoal-gray text-white py-20">
            <div className="max-w-[1200px] mx-auto px-5 md:px-10 grid md:grid-cols-3 gap-12">
                <div>
                    <img src="https://storage.googleapis.com/mm-react-app-videos-photos/Midnight_Madness_logo_white.png" alt="Midnight Madness Logo" className="w-[180px] mb-5" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'}} />
                    <p className="font-sans text-metallic-silver text-sm max-w-xs">Calgary's Premier Double-Decker Party Bus Experience</p>
                </div>
                <div>
                    <h4 className="font-headline font-bold text-lg mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                         <li><button onClick={() => scrollToSection(sectionRefs.fleet)} className="text-metallic-silver hover:text-electric-blue transition-colors">Fleet</button></li>
                         <li><button onClick={() => scrollToSection(sectionRefs.events)} className="text-metallic-silver hover:text-electric-blue transition-colors">Events We Serve</button></li>
                         <li><button onClick={() => scrollToSection(sectionRefs.quote)} className="text-metallic-silver hover:text-electric-blue transition-colors">Book Now</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-headline font-bold text-lg mb-4">Stay Connected</h4>
                    <div className="flex items-center gap-4">
                        <a href="#" aria-label="Instagram" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-electric-blue transition-all"><i className="fab fa-instagram"></i></a>
                        <a href="#" aria-label="Facebook" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-electric-blue transition-all"><i className="fab fa-facebook-f"></i></a>
                    </div>
                </div>
            </div>
            <div className="max-w-[1200px] mx-auto px-5 md:px-10 mt-12 border-t border-steel-gray/30 pt-8 text-center md:text-left md:flex justify-between items-center">
                <p className="text-steel-gray text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Midnight Madness Party Bus & Coaches. All rights reserved.</p>
                <div className="flex items-center justify-center gap-4">
                    <a href="#" className="text-steel-gray text-sm hover:text-electric-blue transition-colors">Privacy Policy</a>
                    <span className="text-steel-gray text-sm">|</span>
                    <a href="#" className="text-steel-gray text-sm hover:text-electric-blue transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    )
};


export default LandingPage;
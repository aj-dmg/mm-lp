import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import PortalPage from './components/PortalPage';
import ExpressPortalPage from './components/ExpressPortalPage';

// Represents the parsed route from the URL hash
interface Route {
    name: 'landing' | 'portal' | 'expressPortal';
    bookingId?: string;
    clientSlug?: string;
}

const getRoute = (hash: string): Route => {
    // Remove the leading '#'
    const path = hash.substring(1);

    if (path.startsWith('/portal/')) {
        const parts = path.split('/'); // e.g., ['', 'portal', 'booking-3']
        if (parts.length >= 3 && parts[2]) {
            return { name: 'portal', bookingId: parts[2] };
        }
    }

    if (path.startsWith('/book/')) {
        const parts = path.split('/'); // e.g., ['', 'book', 'cowboys']
        if (parts.length >= 3 && parts[2]) {
            return { name: 'expressPortal', clientSlug: parts[2] };
        }
    }
    // Default route for anything else (e.g., '', '#', '/#/')
    return { name: 'landing' };
};


const App: React.FC = () => {
    const [route, setRoute] = useState(getRoute(window.location.hash));

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(getRoute(window.location.hash));
        };
        
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    switch (route.name) {
        case 'portal':
            // The getRoute function ensures bookingId is present for the 'portal' route
            return <PortalPage bookingId={route.bookingId!} />;
        case 'expressPortal':
            return <ExpressPortalPage clientSlug={route.clientSlug!} />;
        case 'landing':
        default:
             return <LandingPage />;
    }
};

export default App;
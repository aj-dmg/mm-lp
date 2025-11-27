import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import FleetPage from './components/FleetPage';

// Represents the parsed route from the URL hash
interface Route {
    name: 'landing' | 'fleet';
}

const getRoute = (hash: string): Route => {
    // Remove the leading '#'
    const path = hash.substring(1);
    
    if (path === 'fleet') {
        return { name: 'fleet' };
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
        case 'fleet':
            return <FleetPage />;
        case 'landing':
        default:
             return <LandingPage />;
    }
};

export default App;
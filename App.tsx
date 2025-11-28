import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage.tsx';
import FleetPage from './components/FleetPage.tsx';
import BlogPage from './components/BlogPage.tsx';

// Represents the parsed route from the URL hash
interface Route {
    name: 'landing' | 'fleet' | 'blog';
    params?: Record<string, string>;
}

const getRoute = (hash: string): Route => {
    // Remove the leading '#'
    const path = hash.substring(1);
    const parts = path.split('/');
    
    if (parts[0] === 'fleet') {
        return { name: 'fleet' };
    }
    
    if (parts[0] === 'blog') {
        return { 
            name: 'blog',
            params: parts[1] ? { slug: parts[1] } : undefined
        };
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
        case 'blog':
            return <BlogPage slug={route.params?.slug} />;
        case 'landing':
        default:
             return <LandingPage />;
    }
};

export default App;
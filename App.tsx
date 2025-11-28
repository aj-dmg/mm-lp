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
    // Explicitly handle empty hash or just '#' to ensure Landing Page defaults
    if (!hash || hash === '#') {
        return { name: 'landing' };
    }

    // Robustly remove leading # and any slash
    const cleanHash = hash.replace(/^#\/?/, '');
    
    // If cleanHash is empty (e.g. from '#/'), return landing
    if (!cleanHash) {
        return { name: 'landing' };
    }

    const parts = cleanHash.split('/');
    const mainPath = parts[0]?.toLowerCase(); // Case-insensitive check

    if (mainPath === 'fleet') {
        return { name: 'fleet' };
    }
    
    if (mainPath === 'blog') {
        return { 
            name: 'blog',
            params: parts[1] ? { slug: parts[1] } : undefined
        };
    }

    // Default route for anything else
    return { name: 'landing' };
};


const App: React.FC = () => {
    // Force 'landing' state on initialization, regardless of current window.location.hash
    // This ensures reloads always start at the Landing Page as requested.
    const [route, setRoute] = useState<Route>({ name: 'landing' });

    useEffect(() => {
        // On mount, if there is a hash, clear it so the URL matches the Landing Page view.
        // This prevents a mismatch where URL says #blog but page shows Landing.
        if (window.location.hash && window.location.hash !== '#') {
             try {
                window.history.replaceState(null, '', window.location.pathname);
             } catch (e) {
                console.warn('Failed to clear hash:', e);
             }
        }

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

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
    if (!hash || hash === '#') {
        return { name: 'landing' };
    }

    const cleanHash = hash.replace(/^#\/?/, '');
    
    if (!cleanHash) {
        return { name: 'landing' };
    }

    const parts = cleanHash.split('/');
    const mainPath = parts[0]?.toLowerCase();

    if (mainPath === 'fleet') {
        return { name: 'fleet' };
    }
    
    if (mainPath === 'blog') {
        return { 
            name: 'blog',
            params: parts[1] ? { slug: parts[1] } : undefined
        };
    }

    return { name: 'landing' };
};


const App: React.FC = () => {
    const [route, setRoute] = useState<Route>({ name: 'landing' });

    useEffect(() => {
        // Global Script Initialization for Limo Anywhere
        const scriptId = 'mylimobiz-widget-loader';
        if (!document.getElementById(scriptId)) {
            try {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = "https://book.mylimobiz.com/v4/widgets/widget-loader.js";
                script.type = "text/javascript";
                script.async = true;
                script.crossOrigin = "anonymous";
                document.body.appendChild(script);
            } catch (e) {
                console.warn("Failed to inject global widget script", e);
            }
        }

        // Fix: Use simple hash clearing instead of replaceState.
        // replaceState causes DOMExceptions in blob/sandboxed environments.
        // Clearing the hash ensures that if the user clicks "Our Buses" (which is #fleet),
        // the hash change event will fire properly even if the page was reloaded.
        if (window.location.hash && window.location.hash !== '#') {
             window.location.hash = '';
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

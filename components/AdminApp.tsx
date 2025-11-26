import React from 'react';
import AdminDashboard from './AdminDashboard';

interface AdminAppProps {
    onBackToCustomerView: () => void;
}

const AdminApp: React.FC<AdminAppProps> = ({ onBackToCustomerView }) => {
    return (
        <div className="bg-night-dark min-h-screen text-gray-200 font-sans">
             <header className="bg-night-light shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex items-center gap-3">
                            <img src="https://storage.googleapis.com/mm-react-app-videos-photos/Midnight_Madness_logo_white.png" alt="Midnight Madness Logo" className="h-9 object-contain" />
                            <span className="text-base font-light text-gray-400 border-l border-gray-700 pl-3 tracking-wider">ADMIN</span>
                        </div>
                    </div>
                    <nav>
                        <button
                        onClick={onBackToCustomerView}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm font-medium"
                        >
                        ← Back to Landing Page
                        </button>
                    </nav>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <AdminDashboard />
            </main>
        </div>
    );
};

export default AdminApp;
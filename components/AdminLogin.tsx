import React, { useState, useEffect } from 'react';

interface AdminLoginProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Reset form state when modal is closed
        if (!isOpen) {
            setUsername('');
            setPassword('');
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (username === 'admin' && password === '123456') {
                onLoginSuccess();
            } else {
                setError('Incorrect username or password.');
                setPassword(''); // For security, clear password on failed attempt
            }
            setIsLoading(false);
        }, 500);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
            <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 id="admin-login-title" className="text-2xl font-bold text-white">Admin Login</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none" aria-label="Close">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="admin-username" className="block text-sm font-medium text-gray-300">Username</label>
                        <input
                            id="admin-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-2 px-3"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-2 px-3"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
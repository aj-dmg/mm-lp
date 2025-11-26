import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { CorporateClient } from '../types';
import AddCustomerPageModal from './AddCustomerPageModal';
import EditCustomerPageModal from './EditCustomerPageModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const CustomerBookingAdminPage: React.FC = () => {
    const { corporateClients, contacts, deleteCorporateClient } = useData();
    const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [pageToEdit, setPageToEdit] = useState<CorporateClient | null>(null);
    const [pageToDelete, setPageToDelete] = useState<CorporateClient | null>(null);

    const clientsWithContacts = useMemo(() => {
        return corporateClients.map(client => {
            const primaryContact = contacts.find(c => c.corporateClientId === client.id);
            return {
                ...client,
                contactEmail: primaryContact?.email || 'No contact assigned',
            };
        });
    }, [corporateClients, contacts]);

    const handleCopyPortalLink = (slug: string, clientId: string) => {
        // This creates a robust URL that works even if the app is not at the root of the domain.
        const url = `${window.location.href.split('#')[0]}#/book/${slug}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedClientId(clientId);
            setTimeout(() => setCopiedClientId(null), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy link.');
        });
    };
    
    const handleDelete = async () => {
        if (pageToDelete) {
            try {
                await deleteCorporateClient(pageToDelete.id);
                setPageToDelete(null);
            } catch (error) {
                console.error("Failed to delete customer page:", error);
                alert("Could not delete customer page. Please try again.");
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Customer Booking Pages</h2>
                <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-opacity-80 transition-colors text-sm font-medium">+ Create New Page</button>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Primary Contact Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Booking Page Link</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-night-light divide-y divide-gray-700">
                            {clientsWithContacts.map(client => (
                                <tr key={client.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{client.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {client.contactEmail}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <a 
                                            href={`#/book/${client.slug}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-brand-blue hover:underline"
                                        >
                                            /#/book/{client.slug}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button 
                                            onClick={() => handleCopyPortalLink(client.slug, client.id)}
                                            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs font-medium w-24 text-center"
                                        >
                                            {copiedClientId === client.id ? 'Copied!' : 'Copy Link'}
                                        </button>
                                         <button onClick={() => setPageToEdit(client)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium">Edit</button>
                                        <button onClick={() => setPageToDelete(client)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {corporateClients.length === 0 && (
                        <div className="text-center p-8 text-gray-500">No customer booking pages have been set up yet.</div>
                    )}
                </div>
            </div>
            
            {isAddModalOpen && <AddCustomerPageModal onClose={() => setIsAddModalOpen(false)} />}
            {pageToEdit && <EditCustomerPageModal client={pageToEdit} onClose={() => setPageToEdit(null)} />}
            {pageToDelete && (
                <DeleteConfirmationModal
                    isOpen={!!pageToDelete}
                    onClose={() => setPageToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete Customer Page"
                    message={`Are you sure you want to delete the page for ${pageToDelete.name}? All associated contacts will be unlinked. This action cannot be undone.`}
                />
            )}
        </div>
    );
};

export default CustomerBookingAdminPage;
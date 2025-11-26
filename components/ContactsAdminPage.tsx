import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Contact } from '../types';
import AddContactModal from './AddContactModal';
import EditContactModal from './EditContactModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ContactsAdminPage: React.FC = () => {
    const { contacts, loading, deleteContact } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    const filteredContacts = useMemo(() => {
        const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
        if (!searchTerm) return sorted;
        return sorted.filter(contact => 
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone?.includes(searchTerm) ||
            contact.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);
    
    const handleDelete = async () => {
        if (contactToDelete) {
            try {
                await deleteContact(contactToDelete.id);
                setContactToDelete(null);
            } catch (error) {
                console.error("Failed to delete contact:", error);
                alert("Could not delete contact. Please try again.");
            }
        }
    };


    if (loading) {
        return <div className="text-center p-8">Loading contacts...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-white">Manage Contacts</h2>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white py-2 pl-10 pr-4"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                     <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-opacity-80 transition-colors text-sm font-medium whitespace-nowrap">+ Add Contact</button>
                </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact Info</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lead Source</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Notes</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-night-light divide-y divide-gray-700">
                            {filteredContacts.map(contact => (
                                <tr key={contact.id} className="hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{contact.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <div>{contact.email}</div>
                                        <div className="text-gray-400">{contact.phone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contact.companyName || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{contact.source || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 max-w-xs truncate" title={contact.notes}>{contact.notes || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => setContactToEdit(contact)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium">Edit</button>
                                        <button onClick={() => setContactToDelete(contact)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredContacts.length === 0 && (
                        <div className="text-center p-8 text-gray-500">
                            {searchTerm ? `No contacts found for "${searchTerm}".` : 'No contacts found. Click "Add Contact" to create one.'}
                        </div>
                    )}
                </div>
            </div>

            {isAddModalOpen && <AddContactModal onClose={() => setIsAddModalOpen(false)} />}
            {contactToEdit && <EditContactModal contact={contactToEdit} onClose={() => setContactToEdit(null)} />}
            {contactToDelete && (
                <DeleteConfirmationModal
                    isOpen={!!contactToDelete}
                    onClose={() => setContactToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete Contact"
                    message={`Are you sure you want to delete ${contactToDelete.name}? This action cannot be undone.`}
                />
            )}
        </div>
    );
};

export default ContactsAdminPage;
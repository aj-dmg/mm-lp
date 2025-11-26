import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { toTitleCase } from '../utils';

interface AddCustomerPageModalProps {
  onClose: () => void;
}

const AddCustomerPageModal: React.FC<AddCustomerPageModalProps> = ({ onClose }) => {
  const { addCorporateClient } = useData();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clientData, setClientData] = useState({
    name: '',
    slug: '',
    defaultPickupLocation: '',
    defaultDropoffLocation: '',
    logoUrl: '',
    notes: '',
  });

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newSlug = clientData.slug;
    if (name === 'name') {
      newSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    setClientData(prev => ({ ...prev, [name]: value, slug: name === 'name' ? newSlug : prev.slug }));
  };
  
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData.name || !clientData.slug || !clientData.defaultPickupLocation || !clientData.defaultDropoffLocation || !contactData.name || !contactData.email || !contactData.phone) {
      setError('Please fill out all required fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const formattedClientData = {
        ...clientData,
        defaultPickupLocation: toTitleCase(clientData.defaultPickupLocation),
        defaultDropoffLocation: toTitleCase(clientData.defaultDropoffLocation),
      };
      await addCorporateClient(formattedClientData, contactData);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Customer Page</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="border border-gray-700 p-4 rounded-md">
                <legend className="px-2 font-semibold text-gray-300">Company Details</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Company Name</label>
                        <input name="name" type="text" value={clientData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Page URL Slug</label>
                        <input name="slug" type="text" value={clientData.slug} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400">Default Pickup Location</label>
                    <input name="defaultPickupLocation" type="text" value={clientData.defaultPickupLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400">Default Drop-off Location</label>
                    <input name="defaultDropoffLocation" type="text" value={clientData.defaultDropoffLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400">Company Logo URL (Optional)</label>
                    <input name="logoUrl" type="text" value={clientData.logoUrl} onChange={handleChange} placeholder="https://example.com/logo.png" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400">Internal Notes</label>
                    <textarea name="notes" value={clientData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
            </fieldset>

            <fieldset className="border border-gray-700 p-4 rounded-md">
                <legend className="px-2 font-semibold text-gray-300">Primary Contact</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Contact Name</label>
                        <input name="name" type="text" value={contactData.name} onChange={handleContactChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400">Contact Email</label>
                        <input name="email" type="email" value={contactData.email} onChange={handleContactChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-400">Contact Phone</label>
                    <input name="phone" type="tel" value={contactData.phone} onChange={handleContactChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                </div>
            </fieldset>
          
          <div className="flex justify-end pt-6 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-pink text-white rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerPageModal;
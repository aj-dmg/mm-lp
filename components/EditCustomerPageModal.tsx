import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { CorporateClient } from '../types';
import { toTitleCase } from '../utils';

interface EditCustomerPageModalProps {
  client: CorporateClient;
  onClose: () => void;
}

const EditCustomerPageModal: React.FC<EditCustomerPageModalProps> = ({ client, onClose }) => {
  const { updateCorporateClient } = useData();
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

  useEffect(() => {
    setClientData({
      name: client.name,
      slug: client.slug,
      defaultPickupLocation: client.defaultPickupLocation,
      defaultDropoffLocation: client.defaultDropoffLocation,
      logoUrl: client.logoUrl || '',
      notes: client.notes || '',
    });
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData.name || !clientData.slug || !clientData.defaultPickupLocation || !clientData.defaultDropoffLocation) {
      setError('Please fill out all required company fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const formattedClientData = {
        ...clientData,
        defaultPickupLocation: toTitleCase(clientData.defaultPickupLocation),
        defaultDropoffLocation: toTitleCase(clientData.defaultDropoffLocation),
      }
      await updateCorporateClient(client.id, formattedClientData);
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
          <h2 className="text-2xl font-bold text-white">Edit Customer Page</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
                <label className="block text-sm font-medium text-gray-400">Default Pickup Location</label>
                <input name="defaultPickupLocation" type="text" value={clientData.defaultPickupLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Default Drop-off Location</label>
                <input name="defaultDropoffLocation" type="text" value={clientData.defaultDropoffLocation} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-400">Company Logo URL (Optional)</label>
                <input name="logoUrl" type="text" value={clientData.logoUrl} onChange={handleChange} placeholder="https://example.com/logo.png" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Internal Notes</label>
                <textarea name="notes" value={clientData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
            </div>
          
          <div className="flex justify-end pt-6 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-pink text-white rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerPageModal;
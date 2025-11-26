import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { useData } from '../contexts/DataContext';

interface EditDriverModalProps {
  driver: Driver;
  onClose: () => void;
}

const EditDriverModal: React.FC<EditDriverModalProps> = ({ driver, onClose }) => {
  const { updateDriverDetails } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active' as Driver['status'],
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: driver.name,
      phone: driver.phone || '',
      email: driver.email || '',
      status: driver.status || 'active',
      notes: driver.notes || '',
    });
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError('Name and Email are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await updateDriverDetails(driver.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        status: formData.status,
        notes: formData.notes,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Driver Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Internal Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
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

export default EditDriverModal;
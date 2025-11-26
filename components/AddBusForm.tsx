import React, { useState } from 'react';
import { Bus } from '../types';

interface AddBusFormProps {
  onClose: () => void;
  addBus: (busData: Omit<Bus, 'id' | 'imageUrl'>) => Promise<Bus>;
}

const AddBusForm: React.FC<AddBusFormProps> = ({ onClose, addBus }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '' as number | '',
    features: '',
    startingPrice: '' as number | '',
    color: '#ec4899',
    status: 'active' as Bus['status'],
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.capacity === '' || !formData.features || formData.startingPrice === '' || !formData.color) {
      setError('Please fill out all required fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const { capacity, startingPrice, features, ...rest } = formData;
      const newBusData = {
        ...rest,
        capacity: Number(capacity),
        startingPrice: Number(startingPrice),
        features: features.split(',').map(f => f.trim()).filter(Boolean),
      };
      
      await addBus(newBusData);
      onClose();

    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add a New Bus</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Bus Name</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Capacity</label>
                  <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} min="1" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Starting Price ($/hr)</label>
                  <input name="startingPrice" type="number" value={formData.startingPrice} onChange={handleChange} min="0" className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" required />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Features (comma-separated)</label>
              <textarea name="features" value={formData.features} onChange={handleChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" placeholder="e.g. Laser Lights, Premium Sound System" required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white">
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Tab Color</label>
                    <input name="color" type="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full h-10 p-1 bg-gray-700 border-gray-600 rounded-md shadow-sm cursor-pointer" required />
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Internal Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-brand-pink focus:border-brand-pink text-white" />
            </div>
          
          <div className="flex justify-end pt-6 space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-pink text-white rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Adding...' : 'Add Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusForm;
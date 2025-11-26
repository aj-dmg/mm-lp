import React, { useState, useEffect } from 'react';
import { Bus } from '../types';
import { useData } from '../contexts/DataContext';

interface EditBusModalProps {
  bus: Bus;
  onClose: () => void;
}

const EditBusModal: React.FC<EditBusModalProps> = ({ bus, onClose }) => {
  const { updateBusDetails } = useData();
  const [formData, setFormData] = useState({
    name: '',
    capacity: '' as number | '',
    features: '',
    startingPrice: '' as number | '',
    color: '',
    status: 'active' as Bus['status'],
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: bus.name,
      capacity: bus.capacity,
      features: bus.features.join(', '),
      startingPrice: bus.startingPrice,
      color: bus.color,
      status: bus.status || 'active',
      notes: bus.notes || '',
    });
  }, [bus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      await updateBusDetails(bus.id, {
        name: formData.name,
        capacity: Number(formData.capacity),
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        startingPrice: Number(formData.startingPrice),
        color: formData.color,
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
          <h2 className="text-2xl font-bold text-white">Edit Bus Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Bus Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Capacity</label>
              <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Starting Price ($/hr)</label>
              <input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleChange} min="0" required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Features (comma-separated)</label>
            <textarea name="features" value={formData.features} onChange={handleChange} rows={2} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
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
                <input type="color" name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full h-10 p-1 bg-gray-700 border-gray-600 rounded-md shadow-sm cursor-pointer" />
            </div>
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

export default EditBusModal;
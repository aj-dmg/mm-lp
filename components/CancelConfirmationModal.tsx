import React from 'react';
import { Booking } from '../types';
import { useData } from '../contexts/DataContext';

interface CancelConfirmationModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({ booking, onClose, onConfirm }) => {
  const { contacts } = useData();
  
  if (!booking) return null;

  const contact = contacts.find(c => c.id === booking.contactId);
  const clientName = contact ? contact.name : 'this client';

  const handleConfirm = () => {
    onConfirm(booking.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Confirm Cancellation</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to cancel the booking for <strong className="text-brand-pink">{clientName}</strong> on <strong className="text-brand-blue">{booking.startTime.toLocaleDateString()}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-center pt-6 space-x-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors font-semibold"
          >
            No, Keep Booking
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
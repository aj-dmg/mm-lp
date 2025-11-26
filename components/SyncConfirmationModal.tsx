import React, { useState } from 'react';
import { Driver } from '../types';

interface SyncConfirmationModalProps {
  driver: Driver | null;
  onClose: () => void;
  onConfirm: (driverId: string) => Promise<void>;
}

const SyncConfirmationModal: React.FC<SyncConfirmationModalProps> = ({ driver, onClose, onConfirm }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!driver) return null;

  const handleConfirm = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      await onConfirm(driver.id);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-night-light rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Confirm Calendar Sync</h2>
        <p className="text-gray-300 mb-6">
          This will create a new Google Calendar named <strong className="text-brand-blue">{`Midnight Madness - ${driver.name}`}</strong> and share it with the email address:
        </p>
        <p className="text-lg font-semibold text-brand-pink bg-gray-800 rounded-md py-2 px-4 mb-6">
          {driver.email}
        </p>
        <p className="text-gray-400 text-sm mb-6">
          The driver will need to accept the invitation in their Gmail inbox to see the calendar.
        </p>

        {error && <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-left whitespace-pre-wrap font-mono">{error}</div>}

        <div className="flex justify-center pt-6 space-x-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSyncing}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSyncing}
            className="px-6 py-2 bg-brand-blue text-white rounded-md hover:bg-opacity-80 transition-colors font-semibold disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Confirm & Sync'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncConfirmationModal;
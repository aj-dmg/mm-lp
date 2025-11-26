import React, { useState, useEffect } from 'react';
import { Bus } from '../types';
import { useData } from '../contexts/DataContext';
import BookingRequestForm from './BookingRequestForm';

const BusCard: React.FC<{ bus: Bus; onSelect: () => void; isSelected: boolean }> = ({ bus, onSelect, isSelected }) => (
  <div
    onClick={onSelect}
    className={`bg-night-light rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 ${
      isSelected ? 'border-brand-pink' : 'border-transparent'
    }`}
  >
    <img className="w-full h-48 object-cover" src={bus.imageUrl} alt={bus.name} />
    <div className="p-4">
      <h3 className="text-xl font-bold text-white mb-2">{bus.name}</h3>
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-400">Capacity: {bus.capacity} people</p>
        <p className="text-lg font-bold text-white">
          <span className="text-sm font-normal text-gray-400">Starting at </span>
          ${bus.startingPrice}<span className="text-sm font-normal text-gray-400">/hr</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {bus.features.map((feature) => (
          <span key={feature} className="bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded-full">
            {feature}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const BusCardSkeleton: React.FC = () => (
  <div className="bg-night-light rounded-lg overflow-hidden shadow-lg animate-pulse">
    <div className="w-full h-48 bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="h-5 bg-gray-700 rounded-full w-20"></div>
        <div className="h-5 bg-gray-700 rounded-full w-24"></div>
        <div className="h-5 bg-gray-700 rounded-full w-16"></div>
      </div>
    </div>
  </div>
);

const BookingPage: React.FC = () => {
  const { buses, loading } = useData();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    // Automatically select the first bus when the list loads
    if (!selectedBus && buses.length > 0) {
      setSelectedBus(buses[0]);
    }
  }, [buses, selectedBus]);
  
  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-brand-pink to-brand-blue">
          Choose Your Party Ride
        </h1>
        <p className="text-center text-lg text-gray-400">Select a bus to start your booking request.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BusCardSkeleton />
          <BusCardSkeleton />
          <BusCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buses.map((bus) => (
            <BusCard
              key={bus.id}
              bus={bus}
              onSelect={() => handleSelectBus(bus)}
              isSelected={selectedBus?.id === bus.id}
            />
          ))}
        </div>
      )}

      {!loading && selectedBus && (
        <div className="mt-12 p-4 sm:p-6 bg-night-light rounded-xl shadow-2xl">
           <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Request a Booking for <span className="text-brand-pink">{selectedBus.name}</span>
          </h2>
          <BookingRequestForm bus={selectedBus} />
        </div>
      )}
    </div>
  );
};

export default BookingPage;
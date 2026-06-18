import React, { useState } from 'react';
import { Car, User, Clock, X, CheckCircle } from 'lucide-react';

const ReservationForm = ({ spotId, onSubmit, onCancel, loading }) => {
  const [name, setName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [duration, setDuration] = useState('2');

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      name: name.trim(),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleType: vehicleType,
      duration: parseInt(duration) || 2,
      spotId: spotId
    };

    onSubmit(formData);
  };

  const formatSpotId = (id) => {
    if (!id) return 'N/A';
    if (typeof id === 'string') {
      return id.slice(0, 8);
    }
    if (typeof id === 'number') {
      return id.toString();
    }
    return String(id);
  };

  const displaySpotId = formatSpotId(spotId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Spot ID */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 border border-blue-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-200 font-medium">Parking Spot</p>
              <p className="text-xl font-bold text-white">#{displaySpotId}</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-green-500 rounded-full">
            <span className="text-xs font-medium text-white">Available</span>
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Enter your full name"
            disabled={loading}
          />
        </div>
      </div>

      {/* Vehicle Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Vehicle Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Car className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400 uppercase"
            placeholder="e.g., B 1234 XYZ"
            disabled={loading}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Example: B 1234 XYZ</p>
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Vehicle Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['car', 'motorcycle', 'truck'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setVehicleType(type)}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${vehicleType === type
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              {type === 'car' && '🚗 Car'}
              {type === 'motorcycle' && '🏍️ Motor'}
              {type === 'truck' && '🚛 Truck'}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Duration (hours)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            disabled={loading}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 appearance-none"
          >
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="3">3 hours</option>
            <option value="4">4 hours</option>
            <option value="6">6 hours</option>
            <option value="8">8 hours</option>
            <option value="12">12 hours</option>
            <option value="24">24 hours</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-blue-500/30 hover:shadow-blue-600/40 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Reserve Spot
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;
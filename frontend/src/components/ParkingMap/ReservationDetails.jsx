import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  Calendar, 
  Car, 
  AlertTriangle,
  CheckCircle,
  ParkingSquare,
  User,
  Phone
} from 'lucide-react';

const ReservationDetail = ({ reservation, onEndSession, onClose, loading }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [overtime, setOvertime] = useState('');
  const [isOvertime, setIsOvertime] = useState(false);
  const [status, setStatus] = useState('active');

  const formatTime = (seconds) => {
    if (seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatSpotId = (id) => {
    if (!id) return 'N/A';
    if (typeof id === 'string') {
      return id.slice(0, 8);
    }
    if (typeof id === 'number') {
      return id.toString();
    }
    if (typeof id === 'object') {
      return id.id || id.spotId || 'N/A';
    }
    return String(id);
  };

  const calculateTime = () => {
    if (!reservation) return;

    const now = new Date();
    const startTime = new Date(reservation.check_in_time || reservation.startTime);
    
    const durationMinutes = reservation.duration || 120;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const diff = (endTime - now) / 1000;

    if (diff > 0) {
      setTimeLeft(formatTime(diff));
      setOvertime('');
      setIsOvertime(false);
      setStatus('active');
    } else {
      const overtimeSeconds = Math.abs(diff);
      setTimeLeft('00:00:00');
      setOvertime(formatTime(overtimeSeconds));
      setIsOvertime(true);
      setStatus('expired');
    }
  };

  useEffect(() => {
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  if (!reservation) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ParkingSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Reservation</h3>
          <p className="text-gray-500 mb-8">You don't have any active reservation</p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors text-base font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const displaySpotId = formatSpotId(reservation.spotId || reservation.spot_id);

  return (
    <div className="">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header dengan Gradient */}
        <div className={`px-8 py-6 ${
          status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
          status === 'expired' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
          'bg-gradient-to-r from-gray-500 to-gray-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${
                status === 'active' ? 'bg-white animate-pulse' : 'bg-white/70'
              }`}></div>
              <div>
                <span className="text-white font-bold text-xl">
                  {status === 'active' ? 'Active Session' :
                   status === 'expired' ? 'Over Time' :
                   'Ended'}
                </span>
                <p className="text-white/80 text-sm">
                  Reservation #{reservation.id?.slice(0, 8) || 'N/A'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
            >
            </button>
          </div>
        </div>

        {/* Body dengan padding lebih besar */}
        <div className="p-8 space-y-6">
          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-4">
            {/* Vehicle Info */}
            <div className="col-span-2 md:col-span-1 bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Vehicle</p>
                  <p className="text-lg font-bold text-gray-800">
                    {reservation.vehicle_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {reservation.vehicle_type || 'Car'}
                  </p>
                </div>
              </div>
            </div>

            {/* Spot Info */}
            <div className="col-span-2 md:col-span-1 bg-purple-50 rounded-2xl p-5 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Parking Spot</p>
                  <p className="text-lg font-bold text-gray-800">
                    #{displaySpotId}
                  </p>
                  <p className="text-sm text-gray-500">
                    {reservation.location || 'Parking Area'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(reservation.check_in_time || reservation.startTime).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {reservation.duration || 120} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timer Card - Lebih besar */}
          <div className={`p-6 rounded-2xl ${
            isOvertime ? 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200' : 
            'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${
                  isOvertime ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {isOvertime ? '⏰ Overtime' : '⏱️ Time Remaining'}
                </p>
                <p className={`text-4xl font-bold mt-1 ${
                  isOvertime ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {isOvertime ? overtime : timeLeft}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isOvertime ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {isOvertime ? (
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                )}
              </div>
            </div>
          </div>

          {isOvertime && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700">Overtime Alert</p>
                <p className="text-sm text-amber-600">
                  Parking duration has exceeded the time limit
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer dengan tombol lebih besar */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          {status === 'ended' || reservation.status === 'completed' ? (
            <button
              disabled
              className="w-full py-4 rounded-2xl bg-gray-200 text-gray-500 text-base font-semibold cursor-not-allowed flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-5 h-5" />
              Session Ended
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end this parking session?')) {
                  onEndSession(reservation.id);
                }
              }}
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 flex items-center justify-center gap-3 ${
                status === 'active'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-600/40'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-600/40'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
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
                  <span className="text-xl">🛑</span>
                  {status === 'active' ? 'End Parking Session' : 'End Session (Overtime)'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetail;
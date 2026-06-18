import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ParkingMap from '../components/ParkingMap/ParkingMap';
import ReservationForm from '../components/ReservationForm/ReservationForm';
import ReservationDetails from '../components/ParkingMap/ReservationDetails';
import TodoList from '../components/TodoList/ToDoList';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateParkingSpots } from '../utils/helpers';
import api from '../api/client';
import { 
  ParkingSquare, 
  Car, 
  Clock, 
  CheckCircle,
  XCircle,
  Calendar,
  LayoutDashboard
} from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [parkingSpots, setParkingSpots] = useLocalStorage('parkingSpots', generateParkingSpots(20));
  const [reservations, setReservations] = useLocalStorage('reservations', []);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const activeReservations = reservations.filter(r => r.isActive);
    const updatedSpots = parkingSpots.map(spot => {
      const isReserved = activeReservations.some(r => r.spotId === spot.id);
      return {
        ...spot,
        isAvailable: !isReserved && spot.isAvailable
      };
    });
    setParkingSpots(updatedSpots);
  }, [reservations]);

  const handleSpotClick = (spotId) => {
    if (!isAuthenticated) {
      showToast('Please login to reserve a spot', 'error');
      return;
    }

    const spot = parkingSpots.find(s => s.id === spotId);
    if (!spot || !spot.isAvailable) {
      showToast('This parking spot is not available.', 'error');
      return;
    }
    setSelectedSpot(spotId);
    setShowReservationForm(true);
  };

  const handleReservationSubmit = async (data) => {
    if (selectedSpot === null) return;
    
    setLoading(true);
    try {
      const newReservation = {
        id: Date.now().toString(),
        spotId: selectedSpot,
        ...data,
        isActive: true,
        startTime: new Date().toISOString(),
        duration: 120
      };
      
      setReservations([...reservations, newReservation]);
      showToast('Parking spot reserved successfully!', 'success');
      setShowReservationForm(false);
      setSelectedSpot(null);
    } catch (error) {
      showToast('Failed to reserve parking spot', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (reservationId) => {
    setLoading(true);
    try {
      const updatedReservations = reservations.map(r => 
        r.id === reservationId ? { ...r, isActive: false } : r
      );
      setReservations(updatedReservations);
      showToast('Session ended successfully!', 'success');
      setShowReservationDetails(false);
      setSelectedReservation(null);
    } catch (error) {
      showToast('Failed to end session', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    const activeReservation = reservations.find(r => r.isActive);
    if (activeReservation) {
      setSelectedReservation(activeReservation);
      setShowReservationDetails(true);
    } else {
      showToast('No active reservations found.', 'info');
    }
  };

  const availableSpots = parkingSpots.filter(spot => spot.isAvailable).length;
  const totalSpots = parkingSpots.length;
  const activeReservations = reservations.filter(r => r.isActive).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Parking Map
              </h2>
              <button
                onClick={handleViewDetails}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                My Reservation
              </button>
            </div>
            <ParkingMap 
              parkingSpots={parkingSpots} 
              onSpotClick={handleSpotClick}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/60 shadow-sm h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Tasks
            </h2>
            <TodoList />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Spots</p>
              <p className="text-2xl font-bold text-gray-800">{totalSpots}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ParkingSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Available</p>
              <p className="text-2xl font-bold text-green-600">{availableSpots}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Occupied</p>
              <p className="text-2xl font-bold text-orange-600">{totalSpots - availableSpots}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Sessions</p>
              <p className="text-2xl font-bold text-blue-600">{activeReservations}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showReservationForm}
        onClose={() => {
          setShowReservationForm(false);
          setSelectedSpot(null);
        }}
        title="Reserve Parking Spot"
      >
        <ReservationForm
          spotId={selectedSpot}
          onSubmit={handleReservationSubmit}
          onCancel={() => {
            setShowReservationForm(false);
            setSelectedSpot(null);
          }}
          loading={loading}
        />
      </Modal>

      <Modal
        isOpen={showReservationDetails}
        onClose={() => {
          setShowReservationDetails(false);
          setSelectedReservation(null);
        }}
        title="Reservation Details"
      >
        {selectedReservation && (
          <ReservationDetails
            reservation={selectedReservation}
            onEndSession={handleEndSession}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
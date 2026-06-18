import React, { createContext, useState, useContext } from 'react';

const ParkingContext = createContext();

export const useParking = () => {
    const context = useContext(ParkingContext);
    if (!context) {
        throw new Error('useParking must be used within ParkingProvider');
    }
    return context;
};

export const ParkingProvider = ({ children }) => {
    const [parkingSpots, setParkingSpots] = useState([
        { id: 1, isAvailable: true, position: { x: 100, y: 100 } },
        { id: 2, isAvailable: false, position: { x: 200, y: 100 } },
        { id: 3, isAvailable: true, position: { x: 300, y: 100 } },
        { id: 4, isAvailable: true, position: { x: 100, y: 200 } },
        { id: 5, isAvailable: false, position: { x: 200, y: 200 } },
        { id: 6, isAvailable: true, position: { x: 300, y: 200 } },
        { id: 7, isAvailable: true, position: { x: 100, y: 300 } },
        { id: 8, isAvailable: false, position: { x: 200, y: 300 } },
        { id: 9, isAvailable: true, position: { x: 300, y: 300 } },
    ]);

    const [showReservationDetail, setShowReservationDetail] = useState(false);
    const [activeReservation, setActiveReservation] = useState(null);

    const handleSpotClick = (spotId) => {
        const spot = parkingSpots.find(s => s.id === spotId);
        if (spot && spot.isAvailable) {
            const newReservation = {
                id: `RES-${Date.now()}`,
                location: 'Parkir Area A',
                spotNumber: `A${spotId}`,
                startTime: new Date().toISOString(),
                duration: 60,
                vehicle: 'B 1234 CD'
            };

            setActiveReservation(newReservation);
            setShowReservationDetail(true);

            setParkingSpots(prev =>
                prev.map(s => s.id === spotId ? { ...s, isAvailable: false } : s)
            );
        }
    };

    const handleEndSession = (id) => {
        console.log('Sesi diakhiri:', id);
        setShowReservationDetail(false);
        setActiveReservation(null);
    };

    const value = {
        parkingSpots,
        setParkingSpots,
        showReservationDetail,
        setShowReservationDetail,
        activeReservation,
        setActiveReservation,
        handleSpotClick,
        handleEndSession
    };

    return (
        <ParkingContext.Provider value={value}>
            {children}
        </ParkingContext.Provider>
    );
};
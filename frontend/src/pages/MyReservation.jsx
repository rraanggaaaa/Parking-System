import React, { useState, useEffect } from 'react';
import {
    Clock,
    MapPin,
    Calendar,
    Car,
    ChevronRight,
    AlertCircle,
    ParkingSquare
} from 'lucide-react';
import ReservationDetail from '../components/ParkingMap/ReservationDetail';

const MyReservation = () => {
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = () => {
            setLoading(true);
            const dummyData = [
                {
                    id: 'RES-001',
                    location: 'Parkir Mall A',
                    spotId: 'A12',
                    spot_number: 'A12',
                    startTime: new Date(Date.now() - 3600000).toISOString(),
                    check_in_time: new Date(Date.now() - 3600000).toISOString(),
                    duration: 120,
                    vehicle_number: 'B 1234 CD',
                    vehicle_type: 'Car',
                    status: 'active'
                },
                {
                    id: 'RES-002',
                    location: 'Parkir Kantor',
                    spotId: 'B05',
                    spot_number: 'B05',
                    startTime: new Date(Date.now() - 7200000).toISOString(),
                    check_in_time: new Date(Date.now() - 7200000).toISOString(),
                    duration: 60,
                    vehicle_number: 'D 5678 EF',
                    vehicle_type: 'Motorcycle',
                    status: 'active'
                }
            ];

            setTimeout(() => {
                setReservations(dummyData);
                setLoading(false);
            }, 500);
        };

        fetchReservations();
    }, []);

    const handleEndSession = (id) => {
        console.log('Mengakhiri sesi:', id);
        setReservations(prev => prev.filter(r => r.id !== id));
        setShowDetail(false);
        alert('Sesi parkir telah diakhiri');
    };

    const handleReservationClick = (reservation) => {
        setSelectedReservation(reservation);
        setShowDetail(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-500">Loading reservations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">My Reservations</h2>
                            <p className="text-base text-gray-500 mt-2">
                                {reservations.length} active reservation{reservations.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ParkingSquare className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Daftar reservasi */}
                {reservations.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-xl">
                        <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-14 h-14 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-600">No Reservations</p>
                        <p className="text-base text-gray-400 mt-2">You don't have any active parking reservations</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reservations.map(res => {
                            const now = new Date();
                            const startTime = new Date(res.startTime || res.check_in_time);
                            const endTime = new Date(startTime.getTime() + (res.duration || 120) * 60000);
                            const isExpired = now > endTime;

                            return (
                                <div
                                    key={res.id}
                                    onClick={() => handleReservationClick(res)}
                                    className="bg-white rounded-3xl p-8 shadow-xl border-2 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Header Card */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`px-4 py-2 rounded-full text-sm font-bold ${isExpired
                                                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-200'
                                                        : 'bg-green-100 text-green-700 border-2 border-green-200'
                                                    }`}>
                                                    {isExpired ? '⏰ Overtime' : '● Active'}
                                                </div>
                                                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">
                                                    #{res.id}
                                                </span>
                                            </div>

                                            {/* Grid Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Location */}
                                                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl">
                                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <MapPin className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Location</p>
                                                        <p className="text-lg font-bold text-gray-800">{res.location}</p>
                                                        <p className="text-sm text-gray-500">Spot #{res.spot_number || res.spotId}</p>
                                                    </div>
                                                </div>

                                                {/* Check-in */}
                                                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl">
                                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Check-in</p>
                                                        <p className="text-lg font-bold text-gray-800">
                                                            {new Date(res.startTime || res.check_in_time).toLocaleString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Duration */}
                                                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-2xl">
                                                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-orange-600 font-medium uppercase tracking-wider">Duration</p>
                                                        <p className="text-lg font-bold text-gray-800">{res.duration || 120} minutes</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Vehicle Info */}
                                            <div className="mt-6 flex items-center gap-6 p-4 bg-gray-50 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <Car className="w-5 h-5 text-gray-500" />
                                                    <span className="text-base font-semibold text-gray-700">{res.vehicle_number}</span>
                                                </div>
                                                <div className="w-px h-6 bg-gray-300"></div>
                                                <span className="text-base text-gray-500">{res.vehicle_type || 'Car'}</span>
                                            </div>
                                        </div>

                                        <ChevronRight className="w-8 h-8 text-gray-300 flex-shrink-0 ml-6 mt-2" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tombol kembali */}
                <button
                    onClick={() => window.history.back()}
                    className="mt-8 text-base text-gray-500 hover:text-gray-700 flex items-center gap-2 font-medium"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Modal Detail */}
            {showDetail && selectedReservation && (
                <ReservationDetail
                    reservation={selectedReservation}
                    onEndSession={handleEndSession}
                    onClose={() => setShowDetail(false)}
                    loading={false}
                />
            )}
        </div>
    );
};

export default MyReservation;
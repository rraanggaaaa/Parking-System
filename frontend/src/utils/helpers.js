export const generateParkingSpots = (count) => {
  const spots = [];
  const cols = Math.ceil(Math.sqrt(count));
  const spacing = 120;
  const startX = 50;
  const startY = 50;

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    spots.push({
      id: i + 1,
      isAvailable: Math.random() > 0.3,
      position: {
        x: startX + col * spacing,
        y: startY + row * spacing
      }
    });
  }
  return spots;
};

export const calculateTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Overtime';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m remaining`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatReservationData = (apiData) => {
  return {
    id: apiData.id,
    spotId: apiData.spot_id,
    spot_number: apiData.spot?.spot_number || apiData.spot_id?.slice(0, 6),
    vehicle_number: apiData.vehicle_number,
    vehicle_type: apiData.vehicle_type || 'Car',
    check_in_time: apiData.check_in_time,
    duration: apiData.duration || 120,
    location: apiData.spot?.location || 'Parking Area',
    status: apiData.status || 'active'
  };
};
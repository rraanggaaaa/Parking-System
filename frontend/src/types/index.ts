export interface ParkingSpot {
  id: number;
  isAvailable: boolean;
  position: { x: number; y: number };
  reservedBy?: string;
  reservedUntil?: string;
}

export interface Reservation {
  id: number;
  spotId: number;
  name: string;
  vehicleNumber: string;
  duration: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ParkingMapProps {
  parkingSpots: ParkingSpot[];
  onReserve: (spotId: number) => void;
}

export interface ReservationFormProps {
  spotId: number;
  onSubmit: (reservation: Omit<Reservation, 'id' | 'startTime' | 'endTime' | 'isActive'>) => void;
  onCancel: () => void;
}
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import ParkingSpot from './ParkingSpot';
import { Car, MapPin, AlertCircle } from 'lucide-react';

const ParkingMap = ({ parkingSpots, onSpotClick }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredSpot, setHoveredSpot] = useState(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 500,
          height: rect.height || 400
        });
      }
    };

    setTimeout(updateDimensions, 100);

    const handleResize = () => {
      setTimeout(updateDimensions, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: rect.width || 500,
        height: rect.height || 400
      });
    }
  }, [parkingSpots]);

  const availableCount = parkingSpots.filter(spot => spot.isAvailable).length;
  const occupiedCount = parkingSpots.filter(spot => !spot.isAvailable).length;

  const handleSpotHover = (spotId) => {
    setHoveredSpot(spotId);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50 rounded-2xl overflow-hidden border border-white/60 shadow-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%),
                            radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)`
        }} />
      </div>

      {/* Header Stats */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-white/60">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">
              {availableCount} Available
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-white/60">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <span className="text-xs font-medium text-gray-700">
              {occupiedCount} Occupied
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-white/60">
          <Car className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-medium text-gray-700">
            Total: {parkingSpots.length}
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full pt-12 pb-10"
      >
        {dimensions.width > 0 && dimensions.height > 0 && (
          <Stage width={dimensions.width} height={dimensions.height - 40}>
            <Layer>
              {parkingSpots.map((spot) => (
                <ParkingSpot
                  key={spot.id}
                  id={spot.id}
                  isAvailable={spot.isAvailable}
                  x={spot.position.x}
                  y={spot.position.y}
                  onClick={() => onSpotClick(spot.id)}
                  onMouseEnter={() => handleSpotHover(spot.id)}
                  onMouseLeave={() => handleSpotHover(null)}
                  isHovered={hoveredSpot === spot.id}
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm shadow-green-400/30"></div>
            <span className="text-xs text-gray-600 font-medium">Available</span>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm shadow-red-400/30"></div>
            <span className="text-xs text-gray-600 font-medium">Occupied</span>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs text-gray-600 font-medium">Click to Reserve</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {parkingSpots.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-400 font-medium">No parking spots available</p>
          <p className="text-sm text-gray-300">Please check back later</p>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredSpot && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <div className="px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-lg">
            <p className="text-xs text-white font-medium">
              Spot #{parkingSpots.find(s => s.id === hoveredSpot)?.id?.slice(0, 4) || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;
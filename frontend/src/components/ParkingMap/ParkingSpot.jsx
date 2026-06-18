import React, { useState, useEffect } from 'react';
import { Circle, Text, Group, Rect } from 'react-konva';

const ParkingSpot = ({ id, isAvailable, x, y, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [size, setSize] = useState(38);

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      if (w < 480) setSize(28);
      else if (w < 768) setSize(32);
      else if (w < 1024) setSize(36);
      else setSize(38);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleClick = () => {
    if (!isAvailable) return;
    
    setIsClicked(true);
    onClick();
    setTimeout(() => setIsClicked(false), 200);
  };

  const getStyle = () => {
    if (isAvailable) {
      return {
        fill: isHovered ? '#6ee7b7' : '#34d399',
        stroke: '#059669',
        label: 'Tersedia',
        labelColor: '#065f46'
      };
    }
    return {
      fill: isHovered ? '#fca5a5' : '#f87171',
      stroke: '#dc2626',
      label: 'Terisi',
      labelColor: '#991b1b'
    };
  };

  const style = getStyle();
  const textSize = size * 0.45;
  const labelSize = size * 0.3;

  return (
    <Group
      x={x}
      y={y}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Lingkaran utama - tanpa efek berlebihan */}
      <Circle
        radius={size}
        fill={style.fill}
        stroke={isHovered ? '#fff' : style.stroke}
        strokeWidth={isHovered ? 2.5 : 1.5}
        opacity={isClicked ? 0.6 : 1}
        shadowColor={isHovered ? 'rgba(0,0,0,0.08)' : 'transparent'}
        shadowBlur={isHovered ? 12 : 0}
        shadowOffsetY={isHovered ? 2 : 0}
        perfectDrawEnabled={false}
      />

      {/* Efek klik sederhana */}
      {isClicked && isAvailable && (
        <Circle
          radius={size}
          fill="rgba(255,255,255,0.2)"
          scaleX={1.1}
          scaleY={1.1}
          listening={false}
        />
      )}

      {/* Nomor spot */}
      <Text
        text={String(id)}
        fontSize={textSize}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="600"
        fill="#fff"
        align="center"
        verticalAlign="middle"
        offsetY={2}
        shadowColor="rgba(0,0,0,0.15)"
        shadowBlur={3}
        shadowOffsetY={1}
        shadowEnabled={true}
      />

      {/* Label status - hanya saat hover atau mobile */}
      {(isHovered || window.innerWidth < 640) && (
        <Rect
          x={-size * 0.65}
          y={size + 6}
          width={size * 1.3}
          height={labelSize + 6}
          cornerRadius={4}
          fill="rgba(0,0,0,0.65)"
          listening={false}
        />
      )}

      {(isHovered || window.innerWidth < 640) && (
        <Text
          text={style.label}
          fontSize={labelSize}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
          fill="#fff"
          align="center"
          verticalAlign="middle"
          x={0}
          y={size + 6}
          offsetY={labelSize * 0.5 + 3}
          listening={false}
        />
      )}

      {/* Indikator kecil - hanya untuk available */}
      {isAvailable && (
        <Circle
          radius={size * 0.12}
          x={size * 0.65}
          y={-size * 0.65}
          fill="#059669"
          stroke="#fff"
          strokeWidth={1.5}
          listening={false}
        />
      )}
    </Group>
  );
};

export default ParkingSpot;
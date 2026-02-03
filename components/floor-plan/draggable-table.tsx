'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Table, TableShape, TableStatus } from '@/types';

interface DraggableTableProps {
  table: Table;
  isSelected: boolean;
  isEditMode: boolean;
  snapToGrid: boolean;
  gridSize: number;
  onClick: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const tableStatusConfig: Record<TableStatus, { color: string; bgColor: string; borderColor: string }> = {
  available: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  reserved: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
  },
  occupied: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-400',
  },
  finishing: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
  },
  blocked: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400 border-dashed',
  },
};

const shapeStyles: Record<TableShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg',
  rectangle: 'rounded-lg',
  booth: 'rounded-lg rounded-t-xl',
};

const shapeSizes: Record<TableShape, { width: number; height: number }> = {
  circle: { width: 80, height: 80 },
  square: { width: 80, height: 80 },
  rectangle: { width: 120, height: 70 },
  booth: { width: 100, height: 60 },
};

export function DraggableTable({
  table,
  isSelected,
  isEditMode,
  snapToGrid,
  gridSize,
  onClick,
  onPositionChange,
}: DraggableTableProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [localPosition, setLocalPosition] = useState(table.position);
  const tableRef = useRef<HTMLDivElement>(null);

  const config = tableStatusConfig[table.status];
  const shapeStyle = shapeStyles[table.shape];
  const size = shapeSizes[table.shape];

  // Update local position when table prop changes
  useEffect(() => {
    setLocalPosition(table.position);
  }, [table.position]);

  // Snap position to grid
  const snapPosition = (pos: { x: number; y: number }) => {
    if (!snapToGrid) return pos;
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) {
      onClick();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const rect = tableRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    onClick();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isEditMode) return;

    const parent = tableRef.current?.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const newX = e.clientX - parentRect.left - dragOffset.x;
    const newY = e.clientY - parentRect.top - dragOffset.y;

    // Clamp to parent bounds
    const clampedX = Math.max(0, Math.min(newX, parentRect.width - size.width));
    const clampedY = Math.max(0, Math.min(newY, parentRect.height - size.height));

    setLocalPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const snappedPosition = snapPosition(localPosition);
    setLocalPosition(snappedPosition);
    onPositionChange(snappedPosition);
  };

  // Add/remove global mouse listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, localPosition]);

  return (
    <div
      ref={tableRef}
      className={cn(
        'absolute flex flex-col items-center justify-center border-2 transition-shadow',
        config.bgColor,
        config.borderColor,
        config.color,
        shapeStyle,
        isEditMode && 'cursor-move',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDragging && 'opacity-80 shadow-lg z-50'
      )}
      style={{
        left: localPosition.x,
        top: localPosition.y,
        width: size.width,
        height: size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      <span className="font-bold text-sm">{table.number}</span>
      <span className="text-xs opacity-75">{table.capacity}</span>

      {/* Resize handles (visual only for now) */}
      {isEditMode && isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full" />
        </>
      )}
    </div>
  );
}

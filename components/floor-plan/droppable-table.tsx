'use client';

import { useState } from 'react';
import { useTableStore } from '@/lib/stores/table-store';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { cn } from '@/lib/utils';
import { Users, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Table, TableStatus } from '@/types';

const tableStatusConfig: Record<TableStatus, { color: string; bgColor: string; borderColor: string; label: string }> = {
  available: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    borderColor: 'border-gray-300',
    label: 'Available'
  },
  reserved: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    borderColor: 'border-blue-400',
    label: 'Reserved'
  },
  occupied: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 hover:bg-amber-200',
    borderColor: 'border-amber-400',
    label: 'Occupied'
  },
  finishing: {
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200 animate-pulse',
    borderColor: 'border-green-400',
    label: 'Finishing'
  },
  blocked: {
    color: 'text-red-700',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-400 border-dashed',
    label: 'Blocked'
  },
};

interface DroppableTableProps {
  table: Table;
  isSelected: boolean;
  onClick: () => void;
}

export function DroppableTable({ table, isSelected, onClick }: DroppableTableProps) {
  const { dragState, setDropTarget, assignReservation } = useTableStore();
  const { seatReservation, getReservation } = useReservationStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [justSeated, setJustSeated] = useState(false);

  const config = tableStatusConfig[table.status];
  const canDrop = table.status === 'available' || table.status === 'finishing';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canDrop && dragState.isDragging) {
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
      setDropTarget(table.id);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!canDrop) return;

    const reservationId = e.dataTransfer.getData('reservationId');
    if (!reservationId) return;

    const reservation = getReservation(reservationId);
    if (!reservation) return;

    // Check capacity
    if (reservation.partySize > table.capacity) {
      toast.error('Table too small', {
        description: `Table ${table.number} seats ${table.capacity}, but party size is ${reservation.partySize}`,
      });
      return;
    }

    // Assign the reservation to the table
    assignReservation(table.id, reservationId);
    seatReservation(reservationId, table.id);

    // Show success animation
    setJustSeated(true);
    setTimeout(() => setJustSeated(false), 2000);

    toast.success('Guest seated', {
      description: `${reservation.guestName}'s party seated at Table ${table.number}`,
    });
  };

  return (
    <div
      className={cn(
        'absolute cursor-pointer transition-all duration-200',
        'flex items-center justify-center',
        'border-2 rounded-lg',
        config.bgColor,
        config.borderColor,
        isSelected && 'ring-4 ring-primary ring-offset-2 scale-110',
        isDragOver && canDrop && 'ring-4 ring-green-400 ring-offset-2 scale-110 bg-green-100 border-green-500',
        !canDrop && dragState.isDragging && 'opacity-40',
        justSeated && 'ring-4 ring-green-500 bg-green-200'
      )}
      style={{
        left: table.position.x,
        top: table.position.y,
        width: table.shape === 'circle' ? 80 : table.shape === 'rectangle' ? 120 : 80,
        height: table.shape === 'rectangle' ? 60 : 80,
      }}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {justSeated ? (
        <div className="text-center text-green-700">
          <CheckCircle className="h-8 w-8 mx-auto" />
          <div className="text-xs font-medium mt-1">Seated!</div>
        </div>
      ) : (
        <div className="text-center">
          <div className={cn('text-2xl font-bold', config.color)}>
            {table.number}
          </div>
          {table.status === 'reserved' && table.currentReservationId ? (
            (() => {
              const reservation = getReservation(table.currentReservationId);
              if (reservation) {
                return (
                  <div className={cn('text-[10px] leading-tight', config.color)}>
                    <div className="font-medium truncate max-w-[70px]">{reservation.guestName}</div>
                    <div className="flex items-center justify-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(reservation.dateTime), 'h:mm a')}
                    </div>
                  </div>
                );
              }
              return (
                <div className={cn('text-xs', config.color)}>
                  <Users className="inline h-3 w-3 mr-1" />
                  {table.capacity}
                </div>
              );
            })()
          ) : (
            <div className={cn('text-xs', config.color)}>
              <Users className="inline h-3 w-3 mr-1" />
              {table.capacity}
            </div>
          )}
        </div>
      )}

      {/* Drop indicator overlay */}
      {isDragOver && canDrop && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
          <span className="text-xs font-bold text-green-700">Drop here</span>
        </div>
      )}
    </div>
  );
}

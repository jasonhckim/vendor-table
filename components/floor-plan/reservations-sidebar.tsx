'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { useTableStore } from '@/lib/stores/table-store';
import { useLocationStore } from '@/lib/store';
import { Clock, Users, GripVertical, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/types';

interface ReservationsSidebarProps {
  onDragStart?: (reservation: Reservation) => void;
}

export function ReservationsSidebar({ onDragStart }: ReservationsSidebarProps) {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getReservationsByDate } = useReservationStore();
  const { dragState, startDrag, endDrag } = useTableStore();

  const today = new Date();
  const todayReservations = getReservationsByDate(location.id, today);

  // Filter to show only confirmed reservations that haven't been seated
  const unseatedReservations = todayReservations.filter(
    (r) => (r.status === 'confirmed' || r.status === 'pending') && !r.tableId
  );

  const handleDragStart = (e: React.DragEvent, reservation: Reservation) => {
    e.dataTransfer.setData('reservationId', reservation.id);
    e.dataTransfer.effectAllowed = 'move';
    startDrag(reservation.id);
    onDragStart?.(reservation);
  };

  const handleDragEnd = () => {
    endDrag();
  };

  return (
    <Card className="w-80 shrink-0 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          Upcoming Reservations
          <Badge variant="secondary">{unseatedReservations.length}</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Drag a reservation onto a table to seat the guest
        </p>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
        {unseatedReservations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No pending reservations
          </div>
        ) : (
          unseatedReservations.map((reservation) => (
            <div
              key={reservation.id}
              draggable
              onDragStart={(e) => handleDragStart(e, reservation)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 bg-card cursor-grab active:cursor-grabbing',
                'transition-all hover:shadow-md hover:border-primary/50',
                dragState.draggedReservationId === reservation.id &&
                  'opacity-50 border-primary ring-2 ring-primary/20'
              )}
            >
              <div className="text-muted-foreground shrink-0">
                <GripVertical className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{reservation.guestName}</span>
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Users className="h-3 w-3" />
                    {reservation.partySize}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(reservation.dateTime), 'h:mm a')}
                  </span>
                  {reservation.seatingPreference !== 'any' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {reservation.seatingPreference}
                    </span>
                  )}
                </div>

                {reservation.specialRequests && (
                  <p className="text-xs text-blue-600 mt-1 truncate">
                    {reservation.specialRequests}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

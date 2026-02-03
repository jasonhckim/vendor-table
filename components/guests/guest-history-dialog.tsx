'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar, Users, MapPin, Star } from 'lucide-react';
import { useLocationStore } from '@/lib/store';
import type { GuestProfile } from '@/types';

interface GuestHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: GuestProfile | null;
}

export function GuestHistoryDialog({
  open,
  onOpenChange,
  guest,
}: GuestHistoryDialogProps) {
  const { getAllLocations } = useLocationStore();
  const locations = getAllLocations();

  const getLocationName = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId);
    return location?.name || locationId;
  };

  if (!guest) return null;

  const sortedHistory = [...guest.visitHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {guest.name}
            {guest.tags.includes('VIP') && (
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            )}
          </DialogTitle>
          <DialogDescription>
            Visit history - {guest.totalVisits} total visits
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {sortedHistory.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No visit history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedHistory.map((visit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="text-center min-w-[60px]">
                    <div className="text-2xl font-bold">
                      {format(new Date(visit.date), 'd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(visit.date), 'MMM yyyy')}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getLocationName(visit.locationId)}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        Party of {visit.partySize}
                      </span>
                    </div>

                    {visit.tableId && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Table {visit.tableId}
                      </p>
                    )}

                    {visit.notes && (
                      <p className="text-sm bg-muted/50 rounded px-2 py-1">
                        {visit.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

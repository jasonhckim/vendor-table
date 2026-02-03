'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { toast } from 'sonner';
import type { Reservation, SeatingPreference, ReservationStatus } from '@/types';
import { format } from 'date-fns';

interface EditReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
}

export function EditReservationDialog({
  open,
  onOpenChange,
  reservation,
}: EditReservationDialogProps) {
  const { updateReservation, cancelReservation } = useReservationStore();

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>('any');
  const [status, setStatus] = useState<ReservationStatus>('pending');
  const [specialRequests, setSpecialRequests] = useState('');

  // Update form when reservation changes
  useEffect(() => {
    if (reservation) {
      setGuestName(reservation.guestName);
      setGuestPhone(reservation.guestPhone);
      setGuestEmail(reservation.guestEmail || '');
      setPartySize(reservation.partySize.toString());
      setDate(format(new Date(reservation.dateTime), 'yyyy-MM-dd'));
      setTime(format(new Date(reservation.dateTime), 'HH:mm'));
      setSeatingPreference(reservation.seatingPreference);
      setStatus(reservation.status);
      setSpecialRequests(reservation.specialRequests || '');
    }
  }, [reservation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reservation) return;

    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    const dateTime = new Date(`${date}T${time}`);

    updateReservation(reservation.id, {
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || undefined,
      partySize: parseInt(partySize),
      dateTime,
      seatingPreference,
      status,
      specialRequests: specialRequests.trim() || undefined,
    });

    toast.success('Reservation updated', {
      description: `Updated reservation for ${guestName}`,
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    if (!reservation) return;

    cancelReservation(reservation.id);
    toast.info('Reservation cancelled', {
      description: `Cancelled reservation for ${reservation.guestName}`,
    });
    onOpenChange(false);
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
          <DialogDescription>
            Update reservation details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-guest-name">Guest Name *</Label>
              <Input
                id="edit-guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-guest-phone">Phone *</Label>
              <Input
                id="edit-guest-phone"
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-guest-email">Email</Label>
            <Input
              id="edit-guest-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-party-size">Party Size</Label>
              <Select value={partySize} onValueChange={setPartySize}>
                <SelectTrigger id="edit-party-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seating Preference</Label>
              <Select
                value={seatingPreference}
                onValueChange={(v) => setSeatingPreference(v as SeatingPreference)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="inside">Inside</SelectItem>
                  <SelectItem value="patio">Patio</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ReservationStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="seated">Seated</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-special-requests">Special Requests</Label>
            <Input
              id="edit-special-requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
            >
              Cancel Reservation
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

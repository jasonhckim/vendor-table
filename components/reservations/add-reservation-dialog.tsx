'use client';

import { useState } from 'react';
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
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';
import type { SeatingPreference, ReservationSource } from '@/types';

interface AddReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSource?: ReservationSource;
}

export function AddReservationDialog({
  open,
  onOpenChange,
  defaultSource = 'phone',
}: AddReservationDialogProps) {
  const { getCurrentLocation } = useLocationStore();
  const { addReservation } = useReservationStore();
  const location = getCurrentLocation();

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('18:00');
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>('any');
  const [source, setSource] = useState<ReservationSource>(defaultSource);
  const [specialRequests, setSpecialRequests] = useState('');

  const resetForm = () => {
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setPartySize('2');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('18:00');
    setSeatingPreference('any');
    setSource(defaultSource);
    setSpecialRequests('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    const dateTime = new Date(`${date}T${time}`);

    addReservation({
      locationId: location.id,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || undefined,
      partySize: parseInt(partySize),
      dateTime,
      status: 'pending',
      source,
      seatingPreference,
      specialRequests: specialRequests.trim() || undefined,
    });

    toast.success('Reservation created', {
      description: `Reservation for ${guestName} on ${dateTime.toLocaleDateString()} at ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
          <DialogDescription>
            Create a new reservation for {location.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Guest Name *</Label>
              <Input
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-phone">Phone *</Label>
              <Input
                id="guest-phone"
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-email">Email (optional)</Label>
            <Input
              id="guest-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="party-size">Party Size</Label>
              <Select value={partySize} onValueChange={setPartySize}>
                <SelectTrigger id="party-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {n === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
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
              <Label>Source</Label>
              <Select
                value={source}
                onValueChange={(v) => setSource(v as ReservationSource)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="ios-app">iOS App</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special-requests">Special Requests</Label>
            <Input
              id="special-requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Birthday, anniversary, dietary needs..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Reservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

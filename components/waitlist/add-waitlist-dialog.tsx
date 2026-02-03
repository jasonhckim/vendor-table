'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWaitlistStore } from '@/lib/stores/waitlist-store';
import { useLocationStore } from '@/lib/store';
import type { SeatingPreference, LocationId } from '@/types';

interface AddWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWaitlistDialog({ open, onOpenChange }: AddWaitlistDialogProps) {
  const { addEntry } = useWaitlistStore();
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [quotedWait, setQuotedWait] = useState('15');
  const [seatingPreference, setSeatingPreference] = useState<SeatingPreference>('any');
  const [specialRequests, setSpecialRequests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) return;

    addEntry({
      locationId: location.id as LocationId,
      guestName: name.trim(),
      guestPhone: phone.trim(),
      partySize: parseInt(partySize),
      quotedWaitTime: parseInt(quotedWait),
      seatingPreference,
      specialRequests: specialRequests.trim() || undefined,
    });

    // Reset form
    setName('');
    setPhone('');
    setPartySize('2');
    setQuotedWait('15');
    setSeatingPreference('any');
    setSpecialRequests('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add to Waitlist</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-name">Guest Name *</Label>
              <Input
                id="waitlist-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="waitlist-phone">Phone *</Label>
              <Input
                id="waitlist-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (714) 555-1234"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waitlist-party">Party Size</Label>
              <Select value={partySize} onValueChange={setPartySize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} {size === 1 ? 'guest' : 'guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waitlist-wait">Quoted Wait</Label>
              <Select value={quotedWait} onValueChange={setQuotedWait}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="20">20 minutes</SelectItem>
                  <SelectItem value="25">25 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waitlist-seating">Seating Preference</Label>
            <Select
              value={seatingPreference}
              onValueChange={(v) => setSeatingPreference(v as SeatingPreference)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">No Preference</SelectItem>
                <SelectItem value="inside">Inside</SelectItem>
                <SelectItem value="patio">Patio</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waitlist-requests">Special Requests</Label>
            <Input
              id="waitlist-requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Birthday celebration, high chair needed, etc."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !phone.trim()}>
              Add to Waitlist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

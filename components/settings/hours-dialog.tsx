'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';
import { Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayOfWeek, OperatingHours, LocationId } from '@/types';

const DAYS_OF_WEEK = [
  { value: 0 as DayOfWeek, label: 'Sunday', short: 'Sun' },
  { value: 1 as DayOfWeek, label: 'Monday', short: 'Mon' },
  { value: 2 as DayOfWeek, label: 'Tuesday', short: 'Tue' },
  { value: 3 as DayOfWeek, label: 'Wednesday', short: 'Wed' },
  { value: 4 as DayOfWeek, label: 'Thursday', short: 'Thu' },
  { value: 5 as DayOfWeek, label: 'Friday', short: 'Fri' },
  { value: 6 as DayOfWeek, label: 'Saturday', short: 'Sat' },
];

interface HoursDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Inner form component that resets when location changes via key prop
function HoursForm({
  locationId,
  locationName,
  initialHours,
  onClose,
}: {
  locationId: LocationId;
  locationName: string;
  initialHours: OperatingHours[];
  onClose: () => void;
}) {
  const {
    updateHours,
    getBlockedDatesByLocation,
    addBlockedDate,
    removeBlockedDate,
  } = useSettingsStore();

  const [hours, setHours] = useState<OperatingHours[]>(initialHours);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  const blockedDates = getBlockedDatesByLocation(locationId);

  const handleTimeChange = (dayOfWeek: DayOfWeek, field: 'openTime' | 'closeTime', value: string) => {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const handleToggleDay = (dayOfWeek: DayOfWeek) => {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, isOpen: !h.isOpen } : h
      )
    );
  };

  const handleSave = () => {
    hours.forEach((h) => {
      updateHours(locationId, h.dayOfWeek, h);
    });
    toast.success('Hours updated', {
      description: 'Operating hours have been saved',
    });
    onClose();
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate || !newBlockedReason) return;

    addBlockedDate({
      locationId: locationId,
      date: newBlockedDate,
      reason: newBlockedReason,
    });

    setNewBlockedDate('');
    setNewBlockedReason('');
    toast.success('Blocked date added');
  };

  const handleRemoveBlockedDate = (id: string) => {
    removeBlockedDate(id);
    toast.info('Blocked date removed');
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Hours & Availability
        </DialogTitle>
        <DialogDescription>
          Configure operating hours and blocked dates for {locationName}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Operating Hours */}
        <div className="space-y-4">
          <h3 className="font-semibold">Operating Hours</h3>
          <div className="space-y-2">
            {hours.map((hour) => {
              const day = DAYS_OF_WEEK.find((d) => d.value === hour.dayOfWeek);
              return (
                <div
                  key={hour.dayOfWeek}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-lg border',
                    hour.isOpen ? 'bg-card' : 'bg-muted/50'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleDay(hour.dayOfWeek)}
                    className={cn(
                      'w-20 text-left font-medium transition-colors',
                      hour.isOpen ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {day?.label}
                  </button>

                  {hour.isOpen ? (
                    <>
                      <Input
                        type="time"
                        value={hour.openTime}
                        onChange={(e) => handleTimeChange(hour.dayOfWeek, 'openTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={hour.closeTime}
                        onChange={(e) => handleTimeChange(hour.dayOfWeek, 'closeTime', e.target.value)}
                        className="w-32"
                      />
                    </>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      Closed
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDay(hour.dayOfWeek)}
                    className="ml-auto"
                  >
                    {hour.isOpen ? 'Mark Closed' : 'Mark Open'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blocked Dates */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Blocked Dates
          </h3>

          {/* Add new blocked date */}
          <div className="flex gap-2">
            <Input
              type="date"
              value={newBlockedDate}
              onChange={(e) => setNewBlockedDate(e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="Reason (e.g., Holiday)"
              value={newBlockedReason}
              onChange={(e) => setNewBlockedReason(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddBlockedDate}
              disabled={!newBlockedDate || !newBlockedReason}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List of blocked dates */}
          {blockedDates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocked dates</p>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-2 rounded border bg-red-50"
                >
                  <div>
                    <span className="font-medium text-red-700">
                      {new Date(blocked.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-red-600 ml-2">{blocked.reason}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBlockedDate(blocked.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </>
  );
}

export function HoursDialog({ open, onOpenChange }: HoursDialogProps) {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getHoursByLocation } = useSettingsStore();

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <HoursForm
          key={location.id}
          locationId={location.id}
          locationName={location.name}
          initialHours={getHoursByLocation(location.id)}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

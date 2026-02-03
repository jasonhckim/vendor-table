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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (start: Date, end: Date) => void;
}

type PresetRange = '7d' | '14d' | '30d' | 'week' | 'month' | 'custom';

const PRESET_OPTIONS: { value: PresetRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
];

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetRange>('7d');
  const [customStart, setCustomStart] = useState(format(startDate, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endDate, 'yyyy-MM-dd'));

  const handlePresetSelect = (preset: PresetRange) => {
    setSelectedPreset(preset);

    if (preset === 'custom') return;

    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (preset) {
      case '7d':
        start = subDays(today, 6);
        break;
      case '14d':
        start = subDays(today, 13);
        break;
      case '30d':
        start = subDays(today, 29);
        break;
      case 'week':
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      default:
        start = subDays(today, 6);
    }

    onDateChange(start, end);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);

    if (start <= end) {
      onDateChange(start, end);
      setIsOpen(false);
    }
  };

  const formatDisplayRange = () => {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          {formatDisplayRange()}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Date Range</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset Options */}
          <div className="grid grid-cols-2 gap-2">
            {PRESET_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedPreset === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetSelect(option.value)}
                className="justify-start"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Custom Range Inputs */}
          {selectedPreset === 'custom' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCustomApply} className="w-full">
                Apply Custom Range
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

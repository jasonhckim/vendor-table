'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useLocationStore } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, MapPin, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Location } from '@/types';

interface LocationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCATION_COLORS = [
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Indigo', value: '#6366F1' },
];

const TIMEZONES = [
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
];

interface LocationFormData {
  name: string;
  fullName: string;
  address: string;
  phone: string;
  timezone: string;
  color: string;
}

const emptyForm: LocationFormData = {
  name: '',
  fullName: '',
  address: '',
  phone: '',
  timezone: 'America/Los_Angeles',
  color: '#2563EB',
};

export function LocationsDialog({ open, onOpenChange }: LocationsDialogProps) {
  const { getAllLocations, addLocation, updateLocation, deleteLocation, currentLocationId } = useLocationStore();
  const locations = getAllLocations();

  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LocationFormData>(emptyForm);

  const handleAdd = () => {
    setFormData(emptyForm);
    setMode('add');
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      fullName: location.fullName,
      address: location.address,
      phone: location.phone,
      timezone: location.timezone,
      color: location.color,
    });
    setEditingId(location.id);
    setMode('edit');
  };

  const handleDelete = (location: Location) => {
    if (locations.length <= 1) {
      toast.error('Cannot delete', {
        description: 'You must have at least one location',
      });
      return;
    }

    const success = deleteLocation(location.id);
    if (success) {
      toast.success('Location deleted', {
        description: `${location.name} has been removed`,
      });
    }
  };

  const handleCancel = () => {
    setMode('list');
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }

    if (mode === 'add') {
      const newLocation = addLocation({
        name: formData.name.trim(),
        fullName: formData.fullName.trim() || `I Can Barbecue - ${formData.name.trim()}`,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        timezone: formData.timezone,
        color: formData.color,
        status: 'online',
      });
      toast.success('Location added', {
        description: `${newLocation.name} has been created`,
      });
    } else if (mode === 'edit' && editingId) {
      updateLocation(editingId, {
        name: formData.name.trim(),
        fullName: formData.fullName.trim() || `I Can Barbecue - ${formData.name.trim()}`,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        timezone: formData.timezone,
        color: formData.color,
      });
      toast.success('Location updated', {
        description: `${formData.name} has been updated`,
      });
    }

    handleCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'list' && 'Manage Locations'}
            {mode === 'add' && 'Add New Location'}
            {mode === 'edit' && 'Edit Location'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'list' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg border',
                    location.id === currentLocationId && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: location.color }}
                    >
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {location.name}
                        {location.id === currentLocationId && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {location.address}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(location)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(location)}
                      disabled={locations.length <= 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleAdd} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Downtown"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="e.g., I Can Barbecue - Downtown"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State ZIP"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="(555) 555-0100"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {LOCATION_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center transition-transform',
                      formData.color === color.value && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" />
                {mode === 'add' ? 'Add Location' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

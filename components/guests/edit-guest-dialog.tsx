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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGuestStore } from '@/lib/stores/guest-store';
import { X, Trash2 } from 'lucide-react';
import type { GuestProfile, SeatingPreference } from '@/types';

interface EditGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest: GuestProfile | null;
}

// Inner component that resets when guest changes via key prop
function EditGuestForm({
  guest,
  onClose,
}: {
  guest: GuestProfile;
  onClose: () => void;
}) {
  const { updateGuest, deleteGuest, tags } = useGuestStore();

  const [name, setName] = useState(guest.name);
  const [phone, setPhone] = useState(guest.phone);
  const [email, setEmail] = useState(guest.email || '');
  const [seating, setSeating] = useState<SeatingPreference>(guest.preferences.seating || 'any');
  const [dietary, setDietary] = useState(guest.preferences.dietary?.join(', ') || '');
  const [notes, setNotes] = useState(guest.preferences.notes || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(guest.tags);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) return;

    updateGuest(guest.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      tags: selectedTags,
      preferences: {
        seating: seating !== 'any' ? seating : undefined,
        dietary: dietary ? dietary.split(',').map((d) => d.trim()) : [],
        notes: notes.trim() || undefined,
      },
    });

    onClose();
  };

  const handleDelete = () => {
    deleteGuest(guest.id);
    onClose();
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  if (showDeleteConfirm) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this guest profile? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Guest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name *</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Smith"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-phone">Phone *</Label>
          <Input
            id="edit-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (714) 555-1234"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.name) ? 'default' : 'outline'}
              className="cursor-pointer transition-colors"
              style={{
                backgroundColor: selectedTags.includes(tag.name)
                  ? tag.color
                  : undefined,
                borderColor: tag.color,
                color: selectedTags.includes(tag.name) ? 'white' : tag.color,
              }}
              onClick={() => toggleTag(tag.name)}
            >
              {tag.name}
              {selectedTags.includes(tag.name) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-seating">Preferred Seating</Label>
        <Select value={seating} onValueChange={(v) => setSeating(v as SeatingPreference)}>
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
        <Label htmlFor="edit-dietary">Dietary Restrictions</Label>
        <Input
          id="edit-dietary"
          value={dietary}
          onChange={(e) => setDietary(e.target.value)}
          placeholder="Vegetarian, Gluten-free (comma separated)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-notes">Notes</Label>
        <Input
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special notes about this guest..."
        />
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Guest
        </Button>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || !phone.trim()}>
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}

export function EditGuestDialog({ open, onOpenChange, guest }: EditGuestDialogProps) {
  if (!guest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Guest Profile</DialogTitle>
        </DialogHeader>
        {/* Key prop resets form state when guest changes */}
        <EditGuestForm
          key={guest.id}
          guest={guest}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

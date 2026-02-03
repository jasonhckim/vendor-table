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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGuestStore } from '@/lib/stores/guest-store';
import { X } from 'lucide-react';
import type { SeatingPreference } from '@/types';

interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGuestDialog({ open, onOpenChange }: AddGuestDialogProps) {
  const { addGuest, tags } = useGuestStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [seating, setSeating] = useState<SeatingPreference>('any');
  const [dietary, setDietary] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) return;

    addGuest({
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

    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setSeating('any');
    setDietary('');
    setNotes('');
    setSelectedTags([]);
    onOpenChange(false);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Guest</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (714) 555-1234"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
            <Label htmlFor="seating">Preferred Seating</Label>
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
            <Label htmlFor="dietary">Dietary Restrictions</Label>
            <Input
              id="dietary"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Vegetarian, Gluten-free (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes about this guest..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !phone.trim()}>
              Add Guest
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

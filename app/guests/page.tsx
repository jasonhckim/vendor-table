'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useGuestStore } from '@/lib/stores/guest-store';
import { AddGuestDialog } from '@/components/guests/add-guest-dialog';
import { EditGuestDialog } from '@/components/guests/edit-guest-dialog';
import { GuestHistoryDialog } from '@/components/guests/guest-history-dialog';
import { Search, Plus, Star, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { GuestProfile } from '@/types';

export default function GuestsPage() {
  const { guests, tags } = useGuestStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);

  // Filter guests by search query
  const filteredGuests = guests.filter((guest) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      guest.name.toLowerCase().includes(query) ||
      guest.phone.includes(searchQuery) ||
      (guest.email && guest.email.toLowerCase().includes(query))
    );
  });

  const handleEditGuest = (guest: GuestProfile) => {
    setSelectedGuest(guest);
    setEditDialogOpen(true);
  };

  const handleViewHistory = (guest: GuestProfile) => {
    setSelectedGuest(guest);
    setHistoryDialogOpen(true);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getTagColor = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName);
    return tag?.color || '#6B7280';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Profiles</h1>
          <p className="text-muted-foreground">
            CRM for all guests across locations ({filteredGuests.length} guests)
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Guest
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Guest List */}
      <div className="grid gap-4">
        {filteredGuests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {searchQuery ? 'No guests found matching your search' : 'No guests yet. Add your first guest!'}
            </CardContent>
          </Card>
        ) : (
          filteredGuests.map((guest) => {
            const initials = guest.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            return (
              <Card key={guest.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{guest.name}</h3>
                            {guest.tags.includes('VIP') && (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {guest.tags.map((tagName) => (
                              <Badge
                                key={tagName}
                                variant="secondary"
                                style={{
                                  backgroundColor: `${getTagColor(tagName)}20`,
                                  color: getTagColor(tagName),
                                  borderColor: getTagColor(tagName),
                                }}
                                className="border"
                              >
                                {tagName}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {guest.totalVisits}
                          </div>
                          <div className="text-xs text-muted-foreground">Visits</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {guest.phone}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          Last visit: {guest.lastVisit ? format(new Date(guest.lastVisit), 'MMM d, yyyy') : 'Never'}
                        </div>
                        {guest.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {guest.email}
                          </div>
                        )}
                        {guest.preferences.seating && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            Prefers {guest.preferences.seating}
                          </div>
                        )}
                      </div>

                      {guest.preferences.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                          {guest.preferences.notes}
                        </div>
                      )}

                      {guest.preferences.dietary && guest.preferences.dietary.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Dietary:</span>
                          {guest.preferences.dietary.map((item) => (
                            <Badge key={item} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleViewHistory(guest)}
                        >
                          View History
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGuest(guest)}
                        >
                          Edit Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCall(guest.phone)}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <AddGuestDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditGuestDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        guest={selectedGuest}
      />
      <GuestHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        guest={selectedGuest}
      />
    </div>
  );
}

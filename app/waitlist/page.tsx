'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocationStore } from '@/lib/store';
import { useWaitlistStore } from '@/lib/stores/waitlist-store';
import { AddWaitlistDialog } from '@/components/waitlist/add-waitlist-dialog';
import { NotifyGuestDialog } from '@/components/waitlist/notify-guest-dialog';
import { toast } from 'sonner';
import { Plus, Phone, MessageSquare, Clock, Users, MapPin, X, CheckCircle } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import type { WaitlistEntry } from '@/types';

export default function WaitlistPage() {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getWaitingByLocation, getNotifiedByLocation, seatGuest, cancelEntry, getAverageWaitTime } = useWaitlistStore();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);

  const waitingList = getWaitingByLocation(location.id);
  const notifiedList = getNotifiedByLocation(location.id);
  const averageWait = getAverageWaitTime(location.id);

  const handleNotifyClick = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
    setNotifyDialogOpen(true);
  };

  const handleSeatGuest = (entry: WaitlistEntry) => {
    seatGuest(entry.id);
    toast.success('Guest seated', {
      description: `${entry.guestName}'s party has been seated`,
    });
  };

  const handleRemoveEntry = (entry: WaitlistEntry) => {
    cancelEntry(entry.id);
    toast.info('Removed from waitlist', {
      description: `${entry.guestName} has been removed`,
    });
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getLongestWait = () => {
    if (waitingList.length === 0) return 0;
    return Math.max(
      ...waitingList.map((w) => differenceInMinutes(new Date(), new Date(w.joinedAt)))
    );
  };

  const getTotalGuests = () => {
    return waitingList.reduce((sum, w) => sum + w.partySize, 0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waitlist</h1>
          <p className="text-muted-foreground">
            Currently {waitingList.length} {waitingList.length === 1 ? 'party' : 'parties'} waiting at {location.name}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add to Waitlist
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Waiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{waitingList.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getTotalGuests()} total guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Wait
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {averageWait}
              <span className="text-lg text-muted-foreground ml-1">min</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quoted to guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Longest Wait
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {getLongestWait()}
              <span className="text-lg text-muted-foreground ml-1">min</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current wait time</p>
          </CardContent>
        </Card>
      </div>

      {/* Notified Guests (if any) */}
      {notifiedList.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Ready to Seat ({notifiedList.length})
            </CardTitle>
            <p className="text-sm text-green-600">
              These guests have been notified and are waiting to be seated
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifiedList.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-white rounded-lg border border-green-200 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{entry.guestName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {entry.partySize} guests
                        {entry.notifiedAt && (
                          <>
                            <span className="mx-1">•</span>
                            Notified {differenceInMinutes(new Date(), new Date(entry.notifiedAt))} min ago
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSeatGuest(entry)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Seat Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveEntry(entry)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Current Queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click &quot;Notify Ready&quot; to send an SMS when a table is available
          </p>
        </CardHeader>
        <CardContent>
          {waitingList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No guests waiting</p>
              <p className="text-sm">Add walk-in guests to the waitlist as they arrive</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitingList.map((entry, index) => {
                const actualWaitTime = differenceInMinutes(new Date(), new Date(entry.joinedAt));
                const isOverdue = actualWaitTime > entry.quotedWaitTime + 5;

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border-2 bg-card p-4 transition-all hover:shadow-md',
                      isOverdue && 'border-amber-300 bg-amber-50'
                    )}
                  >
                    {/* Position Badge */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                        {index + 1}
                      </div>
                      {isOverdue && (
                        <Badge variant="outline" className="mt-2 bg-amber-100 text-amber-700 border-amber-300">
                          Overdue
                        </Badge>
                      )}
                    </div>

                    {/* Guest Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{entry.guestName}</h3>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {entry.partySize}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entry.guestPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Waiting {actualWaitTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Quoted {entry.quotedWaitTime} min
                        </span>
                        {entry.seatingPreference !== 'any' && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entry.seatingPreference}
                          </span>
                        )}
                      </div>

                      {entry.specialRequests && (
                        <div className="flex items-start gap-1 text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1">
                          <MessageSquare className="h-3 w-3 mt-0.5 text-blue-600" />
                          <span className="text-blue-900">{entry.specialRequests}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleNotifyClick(entry)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Notify Ready
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleCall(entry.guestPhone)}
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveEntry(entry)}
                      >
                        <X className="h-3 w-3" />
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddWaitlistDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <NotifyGuestDialog
        open={notifyDialogOpen}
        onOpenChange={setNotifyDialogOpen}
        entry={selectedEntry}
      />
    </div>
  );
}

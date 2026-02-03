'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocationStore } from '@/lib/store';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { useWaitlistStore } from '@/lib/stores/waitlist-store';
import { AddReservationDialog } from '@/components/reservations/add-reservation-dialog';
import { AddWaitlistDialog } from '@/components/waitlist/add-waitlist-dialog';
import { NotifyGuestDialog } from '@/components/waitlist/notify-guest-dialog';
import { Users, Calendar, Clock, TrendingUp, Plus, Phone } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import type { WaitlistEntry } from '@/types';

const statusConfig = {
  confirmed: { color: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Confirmed' },
  pending: { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200', label: 'Pending' },
  seated: { color: 'bg-green-500/10 text-green-700 border-green-200', label: 'Seated' },
  completed: { color: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Completed' },
  'no-show': { color: 'bg-red-500/10 text-red-700 border-red-200', label: 'No Show' },
  cancelled: { color: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Cancelled' },
};

const sourceConfig = {
  'ios-app': { label: 'iOS App', icon: '📱', color: 'bg-blue-50 text-blue-700' },
  phone: { label: 'Phone', icon: '📞', color: 'bg-green-50 text-green-700' },
  'walk-in': { label: 'Walk-in', icon: '🚶', color: 'bg-purple-50 text-purple-700' },
  web: { label: 'Web', icon: '🌐', color: 'bg-orange-50 text-orange-700' },
};

export default function DashboardPage() {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getReservationsByLocation, updateStatus } = useReservationStore();
  const { getWaitingByLocation, notifyGuest, seatGuest, getAverageWaitTime } = useWaitlistStore();

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [waitlistDialogOpen, setWaitlistDialogOpen] = useState(false);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState<WaitlistEntry | null>(null);

  // Update current time every minute for waitlist display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get data from stores
  const allReservations = getReservationsByLocation(location.id);
  const waitlist = getWaitingByLocation(location.id);

  // Filter reservations for upcoming
  const upcomingReservations = allReservations
    .filter(r => new Date(r.dateTime) > currentTime)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  // Calculate metrics
  const todayReservations = allReservations.filter(r => {
    const resDate = new Date(r.dateTime);
    return resDate.toDateString() === currentTime.toDateString();
  });

  const metrics = {
    coversToday: todayReservations.reduce((sum, r) => sum + r.partySize, 0),
    currentlySeated: allReservations.filter(r => r.status === 'seated').length,
    upcomingReservations: upcomingReservations.length,
    waitlistDepth: waitlist.length,
    averageWaitTime: getAverageWaitTime(location.id),
    tableUtilization: 72, // Would calculate from table store
  };

  const handleSeatReservation = (reservationId: string, guestName: string) => {
    updateStatus(reservationId, 'seated');
    toast.success('Guest seated', {
      description: `${guestName}'s party has been seated`,
    });
  };

  const handleConfirmReservation = (reservationId: string, guestName: string) => {
    updateStatus(reservationId, 'confirmed');
    toast.success('Reservation confirmed', {
      description: `Confirmed reservation for ${guestName}`,
    });
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNotifyWaitlist = (entry: WaitlistEntry) => {
    setSelectedWaitlistEntry(entry);
    setNotifyDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • {location.name}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setWalkInDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Walk-in Guest
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Covers Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.coversToday}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Seated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentlySeated}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.upcomingReservations} reservations upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.waitlistDepth}</div>
            <p className="text-xs text-muted-foreground">
              ~{metrics.averageWaitTime} min avg wait
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Table Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tableUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              Above target (65%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reservations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upcoming Reservations</CardTitle>
            <Link href="/reservations">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Next 2 hours</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingReservations.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No upcoming reservations
              </div>
            ) : (
              upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-mono text-lg font-semibold">
                        {format(reservation.dateTime, 'h:mm')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(reservation.dateTime, 'a')}
                      </div>
                    </div>
                    
                    <div className="h-12 w-px bg-border" />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reservation.guestName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge className={cn('text-xs', sourceConfig[reservation.source].color)}>
                          {sourceConfig[reservation.source].icon} {sourceConfig[reservation.source].label}
                        </Badge>
                        {reservation.specialRequests && (
                          <span className="text-xs">• {reservation.specialRequests}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={cn('border', statusConfig[reservation.status].color)}>
                      {statusConfig[reservation.status].label}
                    </Badge>
                    {reservation.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmReservation(reservation.id, reservation.guestName)}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleCall(reservation.guestPhone)}
                        >
                          <Phone className="h-3 w-3" />
                          Call
                        </Button>
                      </>
                    ) : reservation.status === 'confirmed' ? (
                      <Button
                        size="sm"
                        onClick={() => handleSeatReservation(reservation.id, reservation.guestName)}
                      >
                        Seat
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Waitlist */}
      {waitlist.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Waitlist</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setWaitlistDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add to Waitlist
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitlist.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      #{index + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.guestName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {entry.partySize} guests
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Waiting {differenceInMinutes(currentTime, new Date(entry.joinedAt))} min •
                        Quoted {entry.quotedWaitTime} min
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleNotifyWaitlist(entry)}
                  >
                    Notify Ready
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AddReservationDialog
        open={walkInDialogOpen}
        onOpenChange={setWalkInDialogOpen}
        defaultSource="walk-in"
      />
      <AddWaitlistDialog
        open={waitlistDialogOpen}
        onOpenChange={setWaitlistDialogOpen}
      />
      <NotifyGuestDialog
        open={notifyDialogOpen}
        onOpenChange={setNotifyDialogOpen}
        entry={selectedWaitlistEntry}
      />
    </div>
  );
}

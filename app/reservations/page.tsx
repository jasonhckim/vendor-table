'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocationStore } from '@/lib/store';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { AddReservationDialog } from '@/components/reservations/add-reservation-dialog';
import { EditReservationDialog } from '@/components/reservations/edit-reservation-dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Users,
  Clock,
  MapPin,
  MessageSquare,
  CheckCircle2,
  MoreVertical,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ReservationStatus, ReservationSource, Reservation } from '@/types';

const statusConfig = {
  confirmed: {
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    label: 'Confirmed',
    icon: CheckCircle2,
  },
  pending: {
    color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    label: 'Pending',
    icon: Clock,
  },
  seated: {
    color: 'bg-green-500/10 text-green-700 border-green-200',
    label: 'Seated',
    icon: CheckCircle2,
  },
  completed: {
    color: 'bg-gray-500/10 text-gray-700 border-gray-200',
    label: 'Completed',
    icon: CheckCircle2,
  },
  'no-show': {
    color: 'bg-red-500/10 text-red-700 border-red-200',
    label: 'No Show',
    icon: Clock,
  },
  cancelled: {
    color: 'bg-gray-500/10 text-gray-700 border-gray-200 line-through',
    label: 'Cancelled',
    icon: Clock,
  },
};

const sourceConfig = {
  'ios-app': { label: 'iOS App', icon: '📱', color: 'bg-blue-50 text-blue-700' },
  phone: { label: 'Phone', icon: '📞', color: 'bg-green-50 text-green-700' },
  'walk-in': { label: 'Walk-in', icon: '🚶', color: 'bg-purple-50 text-purple-700' },
  web: { label: 'Web', icon: '🌐', color: 'bg-orange-50 text-orange-700' },
};

export default function ReservationsPage() {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();
  const { getReservationsByLocation, updateStatus } = useReservationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<ReservationSource | 'all'>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Get reservations from store
  const allReservations = getReservationsByLocation(location.id);

  // Filter reservations
  let filteredReservations = allReservations;

  if (searchQuery) {
    filteredReservations = filteredReservations.filter(
      (r) =>
        r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guestPhone.includes(searchQuery)
    );
  }

  if (statusFilter !== 'all') {
    filteredReservations = filteredReservations.filter((r) => r.status === statusFilter);
  }

  if (sourceFilter !== 'all') {
    filteredReservations = filteredReservations.filter((r) => r.source === sourceFilter);
  }

  // Group by time period
  const today = filteredReservations.filter((r) => {
    const resDate = new Date(r.dateTime);
    const now = new Date();
    return resDate.toDateString() === now.toDateString();
  });

  const upcoming = filteredReservations.filter((r) => {
    const resDate = new Date(r.dateTime);
    const now = new Date();
    return resDate > now && resDate.toDateString() !== now.toDateString();
  });

  const past = filteredReservations.filter((r) => {
    const resDate = new Date(r.dateTime);
    const now = new Date();
    return resDate < now;
  });

  const handleConfirm = (reservation: Reservation) => {
    updateStatus(reservation.id, 'confirmed');
    toast.success('Reservation confirmed', {
      description: `Confirmed reservation for ${reservation.guestName}`,
    });
  };

  const handleSeat = (reservation: Reservation) => {
    updateStatus(reservation.id, 'seated');
    toast.success('Guest seated', {
      description: `${reservation.guestName}'s party has been seated`,
    });
  };

  const handleNoShow = (reservation: Reservation) => {
    updateStatus(reservation.id, 'no-show');
    toast.info('Marked as no-show', {
      description: `${reservation.guestName} marked as no-show`,
    });
  };

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditDialogOpen(true);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">
            Manage all reservations for {location.name}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReservationStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="seated">Seated</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as ReservationSource | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ios-app">iOS App</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="walk-in">Walk-in</SelectItem>
                <SelectItem value="web">Web</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today ({today.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {today.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No reservations for today
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {today.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onConfirm={handleConfirm}
                  onSeat={handleSeat}
                  onNoShow={handleNoShow}
                  onEdit={handleEdit}
                  onCall={handleCall}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No upcoming reservations
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onConfirm={handleConfirm}
                  onSeat={handleSeat}
                  onNoShow={handleNoShow}
                  onEdit={handleEdit}
                  onCall={handleCall}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {past.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No past reservations
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {past.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onConfirm={handleConfirm}
                  onSeat={handleSeat}
                  onNoShow={handleNoShow}
                  onEdit={handleEdit}
                  onCall={handleCall}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddReservationDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
      <EditReservationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        reservation={selectedReservation}
      />
    </div>
  );
}

function ReservationCard({
  reservation,
  onConfirm,
  onSeat,
  onNoShow,
  onEdit,
  onCall,
}: {
  reservation: Reservation;
  onConfirm: (r: Reservation) => void;
  onSeat: (r: Reservation) => void;
  onNoShow: (r: Reservation) => void;
  onEdit: (r: Reservation) => void;
  onCall: (phone: string) => void;
}) {
  const StatusIcon = statusConfig[reservation.status].icon;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Time */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="font-mono text-2xl font-bold">
              {format(new Date(reservation.dateTime), 'h:mm')}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(reservation.dateTime), 'a')}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(reservation.dateTime), 'MMM d')}
            </div>
          </div>

          <div className="h-auto w-px bg-border" />

          {/* Middle: Guest Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{reservation.guestName}</h3>
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {reservation.partySize}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {reservation.guestPhone}
                  </span>
                  {reservation.guestEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {reservation.guestEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={cn('gap-1 border', statusConfig[reservation.status].color)}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig[reservation.status].label}
                </Badge>
                <Badge className={sourceConfig[reservation.source].color}>
                  {sourceConfig[reservation.source].icon}{' '}
                  {sourceConfig[reservation.source].label}
                </Badge>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {reservation.seatingPreference && reservation.seatingPreference !== 'any' && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {reservation.seatingPreference}
                </span>
              )}
              {reservation.specialRequests && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {reservation.specialRequests}
                </span>
              )}
              {reservation.highChairs && reservation.highChairs > 0 && (
                <span className="text-muted-foreground">
                  🪑 {reservation.highChairs} high chair
                  {reservation.highChairs > 1 ? 's' : ''}
                </span>
              )}
              {reservation.kidsInParty && reservation.kidsInParty > 0 && (
                <span className="text-muted-foreground">
                  👶 {reservation.kidsInParty} kids
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              {reservation.status === 'confirmed' && (
                <>
                  <Button size="sm" variant="default" onClick={() => onSeat(reservation)}>
                    Seat Guest
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onNoShow(reservation)}
                  >
                    No Show
                  </Button>
                </>
              )}
              {reservation.status === 'pending' && (
                <>
                  <Button size="sm" variant="default" onClick={() => onConfirm(reservation)}>
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => onCall(reservation.guestPhone)}
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => onEdit(reservation)}>
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { create } from 'zustand';
import type { Reservation, ReservationStatus, LocationId } from '@/types';
import { mockReservations } from '@/lib/mock-data';

interface ReservationStore {
  reservations: Reservation[];

  // CRUD operations
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => Reservation;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;

  // Status management
  updateStatus: (id: string, status: ReservationStatus) => void;
  seatReservation: (id: string, tableId: string) => void;
  markNoShow: (id: string) => void;
  completeReservation: (id: string) => void;
  cancelReservation: (id: string) => void;

  // Queries
  getReservation: (id: string) => Reservation | undefined;
  getReservationsByLocation: (locationId: LocationId) => Reservation[];
  getReservationsByDate: (locationId: LocationId, date: Date) => Reservation[];
  getUpcomingReservations: (locationId: LocationId) => Reservation[];
  getSeatedReservations: (locationId: LocationId) => Reservation[];
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  reservations: mockReservations,

  addReservation: (reservationData) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      reservations: [...state.reservations, newReservation],
    }));

    return newReservation;
  },

  updateReservation: (id, updates) => {
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
      ),
    }));
  },

  deleteReservation: (id) => {
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    }));
  },

  updateStatus: (id, status) => {
    get().updateReservation(id, { status });
  },

  seatReservation: (id, tableId) => {
    get().updateReservation(id, { status: 'seated', tableId });
  },

  markNoShow: (id) => {
    get().updateReservation(id, { status: 'no-show' });
  },

  completeReservation: (id) => {
    get().updateReservation(id, { status: 'completed' });
  },

  cancelReservation: (id) => {
    get().updateReservation(id, { status: 'cancelled' });
  },

  getReservation: (id) => {
    return get().reservations.find((r) => r.id === id);
  },

  getReservationsByLocation: (locationId) => {
    return get().reservations.filter((r) => r.locationId === locationId);
  },

  getReservationsByDate: (locationId, date) => {
    const dateStr = date.toDateString();
    return get().reservations.filter(
      (r) => r.locationId === locationId && new Date(r.dateTime).toDateString() === dateStr
    );
  },

  getUpcomingReservations: (locationId) => {
    const now = new Date();
    return get().reservations.filter(
      (r) =>
        r.locationId === locationId &&
        new Date(r.dateTime) > now &&
        r.status !== 'cancelled' &&
        r.status !== 'no-show' &&
        r.status !== 'completed'
    );
  },

  getSeatedReservations: (locationId) => {
    return get().reservations.filter(
      (r) => r.locationId === locationId && r.status === 'seated'
    );
  },
}));

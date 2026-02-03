import { create } from 'zustand';
import type { WaitlistEntry, LocationId } from '@/types';
import { mockWaitlist } from '@/lib/mock-data';

interface WaitlistStore {
  entries: WaitlistEntry[];

  // CRUD operations
  addEntry: (entry: Omit<WaitlistEntry, 'id' | 'joinedAt' | 'status'>) => WaitlistEntry;
  updateEntry: (id: string, updates: Partial<WaitlistEntry>) => void;
  removeEntry: (id: string) => void;

  // Status management
  notifyGuest: (id: string) => void;
  seatGuest: (id: string) => void;
  markExpired: (id: string) => void;
  cancelEntry: (id: string) => void;

  // Queries
  getEntry: (id: string) => WaitlistEntry | undefined;
  getWaitingByLocation: (locationId: LocationId) => WaitlistEntry[];
  getNotifiedByLocation: (locationId: LocationId) => WaitlistEntry[];
  getAverageWaitTime: (locationId: LocationId) => number;
  getPosition: (id: string, locationId: LocationId) => number;
}

export const useWaitlistStore = create<WaitlistStore>((set, get) => ({
  entries: mockWaitlist,

  addEntry: (entryData) => {
    const newEntry: WaitlistEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      joinedAt: new Date(),
      status: 'waiting',
    };

    set((state) => ({
      entries: [...state.entries, newEntry],
    }));

    return newEntry;
  },

  updateEntry: (id, updates) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  removeEntry: (id) => {
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },

  notifyGuest: (id) => {
    get().updateEntry(id, { status: 'notified', notifiedAt: new Date() });
  },

  seatGuest: (id) => {
    get().updateEntry(id, { status: 'seated' });
  },

  markExpired: (id) => {
    get().updateEntry(id, { status: 'expired' });
  },

  cancelEntry: (id) => {
    get().updateEntry(id, { status: 'cancelled' });
  },

  getEntry: (id) => {
    return get().entries.find((e) => e.id === id);
  },

  getWaitingByLocation: (locationId) => {
    return get().entries
      .filter((e) => e.locationId === locationId && e.status === 'waiting')
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
  },

  getNotifiedByLocation: (locationId) => {
    return get().entries.filter(
      (e) => e.locationId === locationId && e.status === 'notified'
    );
  },

  getAverageWaitTime: (locationId) => {
    const waiting = get().getWaitingByLocation(locationId);
    if (waiting.length === 0) return 0;

    const totalQuoted = waiting.reduce((sum, e) => sum + e.quotedWaitTime, 0);
    return Math.round(totalQuoted / waiting.length);
  },

  getPosition: (id, locationId) => {
    const waiting = get().getWaitingByLocation(locationId);
    const index = waiting.findIndex((e) => e.id === id);
    return index + 1; // 1-indexed position
  },
}));

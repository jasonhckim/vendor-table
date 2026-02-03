import { create } from 'zustand';
import type { GuestProfile, GuestTag } from '@/types';
import { mockGuestProfiles, defaultGuestTags } from '@/lib/mock-data';

interface GuestStore {
  guests: GuestProfile[];
  tags: GuestTag[];

  // Guest CRUD
  addGuest: (guest: Omit<GuestProfile, 'id' | 'createdAt' | 'totalVisits' | 'visitHistory'>) => GuestProfile;
  updateGuest: (id: string, updates: Partial<GuestProfile>) => void;
  deleteGuest: (id: string) => void;

  // Tag management
  addTag: (name: string, color: string) => GuestTag;
  updateTag: (id: string, updates: Partial<GuestTag>) => void;
  deleteTag: (id: string) => void;

  // Guest tag management
  addTagToGuest: (guestId: string, tagName: string) => void;
  removeTagFromGuest: (guestId: string, tagName: string) => void;

  // Queries
  getGuest: (id: string) => GuestProfile | undefined;
  getGuestByPhone: (phone: string) => GuestProfile | undefined;
  searchGuests: (query: string) => GuestProfile[];
  getGuestsByTag: (tagName: string) => GuestProfile[];
  getVIPGuests: () => GuestProfile[];
}

export const useGuestStore = create<GuestStore>((set, get) => ({
  guests: mockGuestProfiles,
  tags: defaultGuestTags,

  addGuest: (guestData) => {
    const newGuest: GuestProfile = {
      ...guestData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      totalVisits: 0,
      visitHistory: [],
    };

    set((state) => ({
      guests: [...state.guests, newGuest],
    }));

    return newGuest;
  },

  updateGuest: (id, updates) => {
    set((state) => ({
      guests: state.guests.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    }));
  },

  deleteGuest: (id) => {
    set((state) => ({
      guests: state.guests.filter((g) => g.id !== id),
    }));
  },

  addTag: (name, color) => {
    const newTag: GuestTag = {
      id: crypto.randomUUID(),
      name,
      color,
    };

    set((state) => ({
      tags: [...state.tags, newTag],
    }));

    return newTag;
  },

  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteTag: (id) => {
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    }));
  },

  addTagToGuest: (guestId, tagName) => {
    const guest = get().getGuest(guestId);
    if (guest && !guest.tags.includes(tagName)) {
      get().updateGuest(guestId, { tags: [...guest.tags, tagName] });
    }
  },

  removeTagFromGuest: (guestId, tagName) => {
    const guest = get().getGuest(guestId);
    if (guest) {
      get().updateGuest(guestId, { tags: guest.tags.filter((t) => t !== tagName) });
    }
  },

  getGuest: (id) => {
    return get().guests.find((g) => g.id === id);
  },

  getGuestByPhone: (phone) => {
    // Normalize phone for comparison
    const normalizedPhone = phone.replace(/\D/g, '');
    return get().guests.find((g) => g.phone.replace(/\D/g, '') === normalizedPhone);
  },

  searchGuests: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().guests.filter(
      (g) =>
        g.name.toLowerCase().includes(lowerQuery) ||
        g.phone.includes(query) ||
        (g.email && g.email.toLowerCase().includes(lowerQuery))
    );
  },

  getGuestsByTag: (tagName) => {
    return get().guests.filter((g) => g.tags.includes(tagName));
  },

  getVIPGuests: () => {
    return get().guests.filter((g) => g.tags.includes('VIP'));
  },
}));

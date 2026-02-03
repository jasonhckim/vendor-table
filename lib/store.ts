// Multi-location state management with Zustand

import { create } from 'zustand';
import type { Location, LocationId } from '@/types';

// Default location data
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'tustin',
    name: 'Tustin',
    fullName: 'I Can Barbecue - Tustin',
    address: '12345 Main St, Tustin, CA 92780',
    phone: '(714) 555-0100',
    timezone: 'America/Los_Angeles',
    color: '#2563EB', // Blue
    status: 'online',
  },
  {
    id: 'santa-ana',
    name: 'Santa Ana',
    fullName: 'I Can Barbecue - Santa Ana',
    address: '67890 Broadway, Santa Ana, CA 92701',
    phone: '(714) 555-0200',
    timezone: 'America/Los_Angeles',
    color: '#10B981', // Green
    status: 'online',
  },
];

interface LocationStore {
  locations: Location[];
  currentLocationId: LocationId;
  setCurrentLocation: (locationId: LocationId) => void;
  getCurrentLocation: () => Location;
  getAllLocations: () => Location[];
  addLocation: (location: Omit<Location, 'id'>) => Location;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => boolean;
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: DEFAULT_LOCATIONS,
  currentLocationId: 'tustin', // Default to Tustin

  setCurrentLocation: (locationId: LocationId) => {
    set({ currentLocationId: locationId });
    // In production, persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('datables:currentLocation', locationId);
    }
  },

  getCurrentLocation: () => {
    const { currentLocationId, locations } = get();
    return locations.find(loc => loc.id === currentLocationId) || locations[0];
  },

  getAllLocations: () => get().locations,

  addLocation: (locationData) => {
    const id = locationData.name.toLowerCase().replace(/\s+/g, '-');
    const newLocation: Location = {
      ...locationData,
      id,
    };
    set((state) => ({
      locations: [...state.locations, newLocation],
    }));
    return newLocation;
  },

  updateLocation: (id, updates) => {
    set((state) => ({
      locations: state.locations.map((loc) =>
        loc.id === id ? { ...loc, ...updates } : loc
      ),
    }));
  },

  deleteLocation: (id) => {
    const { locations, currentLocationId } = get();
    // Don't allow deleting the last location
    if (locations.length <= 1) {
      return false;
    }
    // If deleting current location, switch to first available
    if (currentLocationId === id) {
      const newCurrent = locations.find((loc) => loc.id !== id);
      if (newCurrent) {
        set({ currentLocationId: newCurrent.id });
      }
    }
    set((state) => ({
      locations: state.locations.filter((loc) => loc.id !== id),
    }));
    return true;
  },
}));

// Firebase sync status
interface SyncStatus {
  status: 'live' | 'syncing' | 'offline' | 'error';
  lastSync?: Date;
  error?: string;
}

interface SyncStore {
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  syncStatus: { status: 'live', lastSync: new Date() },
  setSyncStatus: (status: SyncStatus) => set({ syncStatus: status }),
}));

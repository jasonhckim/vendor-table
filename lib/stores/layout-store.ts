import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocationId, FloorLayout } from '@/types';

interface LayoutStore {
  layouts: FloorLayout[];

  // CRUD operations
  saveLayout: (name: string, locationId: LocationId, tables: FloorLayout['tables']) => FloorLayout;
  updateLayout: (layoutId: string, updates: Partial<Omit<FloorLayout, 'id' | 'createdAt'>>) => void;
  deleteLayout: (layoutId: string) => void;

  // Default layout management
  setDefaultLayout: (layoutId: string) => void;
  getDefaultLayout: (locationId: LocationId) => FloorLayout | undefined;

  // Queries
  getLayout: (layoutId: string) => FloorLayout | undefined;
  getLayoutsByLocation: (locationId: LocationId) => FloorLayout[];
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      layouts: [],

      saveLayout: (name, locationId, tables) => {
        const newLayout: FloorLayout = {
          id: crypto.randomUUID(),
          locationId,
          name,
          isDefault: false,
          tables,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          layouts: [...state.layouts, newLayout],
        }));

        return newLayout;
      },

      updateLayout: (layoutId, updates) => {
        set((state) => ({
          layouts: state.layouts.map((layout) =>
            layout.id === layoutId
              ? { ...layout, ...updates, updatedAt: new Date() }
              : layout
          ),
        }));
      },

      deleteLayout: (layoutId) => {
        set((state) => ({
          layouts: state.layouts.filter((layout) => layout.id !== layoutId),
        }));
      },

      setDefaultLayout: (layoutId) => {
        const layout = get().getLayout(layoutId);
        if (!layout) return;

        set((state) => ({
          layouts: state.layouts.map((l) => ({
            ...l,
            isDefault: l.locationId === layout.locationId
              ? l.id === layoutId
              : l.isDefault,
          })),
        }));
      },

      getDefaultLayout: (locationId) => {
        return get().layouts.find(
          (layout) => layout.locationId === locationId && layout.isDefault
        );
      },

      getLayout: (layoutId) => {
        return get().layouts.find((layout) => layout.id === layoutId);
      },

      getLayoutsByLocation: (locationId) => {
        return get().layouts
          .filter((layout) => layout.locationId === locationId)
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      },
    }),
    {
      name: 'datables-layouts',
      partialize: (state) => ({ layouts: state.layouts }),
      // Custom serialization for dates
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert date strings back to Date objects
          if (parsed.state?.layouts) {
            parsed.state.layouts = parsed.state.layouts.map((layout: FloorLayout) => ({
              ...layout,
              createdAt: new Date(layout.createdAt),
              updatedAt: new Date(layout.updatedAt),
            }));
          }
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

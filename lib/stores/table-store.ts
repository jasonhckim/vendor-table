import { create } from 'zustand';
import type { Table, TableStatus, LocationId, FloorSection } from '@/types';
import { mockTables, mockFloorSections } from '@/lib/mock-data';

interface DragState {
  isDragging: boolean;
  draggedReservationId: string | null;
  dropTargetTableId: string | null;
}

interface TableStore {
  tables: Table[];
  sections: FloorSection[];
  dragState: DragState;

  // Table CRUD
  addTable: (table: Omit<Table, 'id'>) => Table;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;

  // Status management
  updateTableStatus: (id: string, status: TableStatus) => void;
  assignReservation: (tableId: string, reservationId: string) => void;
  clearTable: (tableId: string) => void;
  blockTable: (tableId: string) => void;
  unblockTable: (tableId: string) => void;

  // Position management (for floor plan editor)
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;
  bulkUpdatePositions: (positions: { tableId: string; position: { x: number; y: number } }[]) => void;

  // Drag-and-drop
  startDrag: (reservationId: string) => void;
  setDropTarget: (tableId: string | null) => void;
  endDrag: () => void;

  // Section management
  addSection: (section: Omit<FloorSection, 'id'>) => FloorSection;
  updateSection: (id: string, updates: Partial<FloorSection>) => void;
  deleteSection: (id: string) => void;

  // Queries
  getTable: (id: string) => Table | undefined;
  getTablesByLocation: (locationId: LocationId) => Table[];
  getTablesBySection: (locationId: LocationId, section: string) => Table[];
  getAvailableTables: (locationId: LocationId) => Table[];
  getSectionsByLocation: (locationId: LocationId) => FloorSection[];
  getTableUtilization: (locationId: LocationId) => number;
}

export const useTableStore = create<TableStore>((set, get) => ({
  tables: mockTables,
  sections: mockFloorSections,
  dragState: {
    isDragging: false,
    draggedReservationId: null,
    dropTargetTableId: null,
  },

  addTable: (tableData) => {
    const newTable: Table = {
      ...tableData,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      tables: [...state.tables, newTable],
    }));

    return newTable;
  },

  updateTable: (id, updates) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteTable: (id) => {
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== id),
    }));
  },

  updateTableStatus: (id, status) => {
    get().updateTable(id, { status });
  },

  assignReservation: (tableId, reservationId) => {
    get().updateTable(tableId, {
      status: 'occupied',
      currentReservationId: reservationId,
    });
  },

  clearTable: (tableId) => {
    get().updateTable(tableId, {
      status: 'available',
      currentReservationId: undefined,
    });
  },

  blockTable: (tableId) => {
    get().updateTable(tableId, { status: 'blocked' });
  },

  unblockTable: (tableId) => {
    get().updateTable(tableId, { status: 'available' });
  },

  updateTablePosition: (id, position) => {
    get().updateTable(id, { position });
  },

  bulkUpdatePositions: (positions) => {
    set((state) => ({
      tables: state.tables.map((table) => {
        const positionUpdate = positions.find((p) => p.tableId === table.id);
        if (positionUpdate) {
          return { ...table, position: positionUpdate.position };
        }
        return table;
      }),
    }));
  },

  startDrag: (reservationId) => {
    set({
      dragState: {
        isDragging: true,
        draggedReservationId: reservationId,
        dropTargetTableId: null,
      },
    });
  },

  setDropTarget: (tableId) => {
    set((state) => ({
      dragState: { ...state.dragState, dropTargetTableId: tableId },
    }));
  },

  endDrag: () => {
    set({
      dragState: {
        isDragging: false,
        draggedReservationId: null,
        dropTargetTableId: null,
      },
    });
  },

  addSection: (sectionData) => {
    const newSection: FloorSection = {
      ...sectionData,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      sections: [...state.sections, newSection],
    }));

    return newSection;
  },

  updateSection: (id, updates) => {
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },

  deleteSection: (id) => {
    set((state) => ({
      sections: state.sections.filter((s) => s.id !== id),
    }));
  },

  getTable: (id) => {
    return get().tables.find((t) => t.id === id);
  },

  getTablesByLocation: (locationId) => {
    return get().tables.filter((t) => t.locationId === locationId);
  },

  getTablesBySection: (locationId, section) => {
    return get().tables.filter(
      (t) => t.locationId === locationId && t.section === section
    );
  },

  getAvailableTables: (locationId) => {
    return get().tables.filter(
      (t) => t.locationId === locationId && t.status === 'available'
    );
  },

  getSectionsByLocation: (locationId) => {
    return get().sections
      .filter((s) => s.locationId === locationId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getTableUtilization: (locationId) => {
    const tables = get().getTablesByLocation(locationId);
    if (tables.length === 0) return 0;

    const occupied = tables.filter(
      (t) => t.status === 'occupied' || t.status === 'reserved'
    ).length;

    return Math.round((occupied / tables.length) * 100);
  },
}));

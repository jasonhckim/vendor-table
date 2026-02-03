import { create } from 'zustand';
import type {
  OperatingHours,
  BlockedDate,
  SMSTemplate,
  LocationId,
  DayOfWeek
} from '@/types';
import {
  mockOperatingHours,
  mockBlockedDates,
  mockSMSTemplates
} from '@/lib/mock-data';

interface SettingsStore {
  operatingHours: OperatingHours[];
  blockedDates: BlockedDate[];
  smsTemplates: SMSTemplate[];

  // Operating Hours
  updateHours: (locationId: LocationId, dayOfWeek: DayOfWeek, updates: Partial<OperatingHours>) => void;
  getHoursByLocation: (locationId: LocationId) => OperatingHours[];
  getHoursForDay: (locationId: LocationId, dayOfWeek: DayOfWeek) => OperatingHours | undefined;
  isOpenOnDay: (locationId: LocationId, dayOfWeek: DayOfWeek) => boolean;

  // Blocked Dates
  addBlockedDate: (blockedDate: Omit<BlockedDate, 'id'>) => BlockedDate;
  removeBlockedDate: (id: string) => void;
  getBlockedDatesByLocation: (locationId: LocationId) => BlockedDate[];
  isDateBlocked: (locationId: LocationId, date: string) => boolean;

  // SMS Templates
  addTemplate: (template: Omit<SMSTemplate, 'id'>) => SMSTemplate;
  updateTemplate: (id: string, updates: Partial<SMSTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplatesByLocation: (locationId: LocationId) => SMSTemplate[];
  getDefaultTemplate: (locationId: LocationId, type: SMSTemplate['type']) => SMSTemplate | undefined;
  setDefaultTemplate: (id: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  operatingHours: mockOperatingHours,
  blockedDates: mockBlockedDates,
  smsTemplates: mockSMSTemplates,

  updateHours: (locationId, dayOfWeek, updates) => {
    set((state) => ({
      operatingHours: state.operatingHours.map((h) =>
        h.locationId === locationId && h.dayOfWeek === dayOfWeek
          ? { ...h, ...updates }
          : h
      ),
    }));
  },

  getHoursByLocation: (locationId) => {
    return get().operatingHours
      .filter((h) => h.locationId === locationId)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  },

  getHoursForDay: (locationId, dayOfWeek) => {
    return get().operatingHours.find(
      (h) => h.locationId === locationId && h.dayOfWeek === dayOfWeek
    );
  },

  isOpenOnDay: (locationId, dayOfWeek) => {
    const hours = get().getHoursForDay(locationId, dayOfWeek);
    return hours?.isOpen ?? false;
  },

  addBlockedDate: (blockedDateData) => {
    const newBlockedDate: BlockedDate = {
      ...blockedDateData,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      blockedDates: [...state.blockedDates, newBlockedDate],
    }));

    return newBlockedDate;
  },

  removeBlockedDate: (id) => {
    set((state) => ({
      blockedDates: state.blockedDates.filter((d) => d.id !== id),
    }));
  },

  getBlockedDatesByLocation: (locationId) => {
    return get().blockedDates.filter((d) => d.locationId === locationId);
  },

  isDateBlocked: (locationId, date) => {
    return get().blockedDates.some(
      (d) => d.locationId === locationId && d.date === date
    );
  },

  addTemplate: (templateData) => {
    const newTemplate: SMSTemplate = {
      ...templateData,
      id: crypto.randomUUID(),
    };

    set((state) => ({
      smsTemplates: [...state.smsTemplates, newTemplate],
    }));

    return newTemplate;
  },

  updateTemplate: (id, updates) => {
    set((state) => ({
      smsTemplates: state.smsTemplates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  deleteTemplate: (id) => {
    set((state) => ({
      smsTemplates: state.smsTemplates.filter((t) => t.id !== id),
    }));
  },

  getTemplatesByLocation: (locationId) => {
    return get().smsTemplates.filter((t) => t.locationId === locationId);
  },

  getDefaultTemplate: (locationId, type) => {
    return get().smsTemplates.find(
      (t) => t.locationId === locationId && t.type === type && t.isDefault
    );
  },

  setDefaultTemplate: (id) => {
    const template = get().smsTemplates.find((t) => t.id === id);
    if (!template) return;

    // Unset any existing default for this type/location
    set((state) => ({
      smsTemplates: state.smsTemplates.map((t) => {
        if (t.locationId === template.locationId && t.type === template.type) {
          return { ...t, isDefault: t.id === id };
        }
        return t;
      }),
    }));
  },
}));

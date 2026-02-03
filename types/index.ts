// Core data types for Datables

export type LocationId = string;

export interface Location {
  id: LocationId;
  name: string;
  fullName: string;
  address: string;
  phone: string;
  timezone: string;
  color: string; // Badge color for location
  status: 'online' | 'alerts' | 'offline';
}

export type ReservationStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'seated' 
  | 'completed' 
  | 'no-show' 
  | 'cancelled';

export type ReservationSource = 
  | 'ios-app' 
  | 'phone' 
  | 'walk-in' 
  | 'web';

export type SeatingPreference = 
  | 'inside' 
  | 'bar' 
  | 'patio' 
  | 'any';

export interface Reservation {
  id: string;
  locationId: LocationId;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  partySize: number;
  dateTime: Date;
  status: ReservationStatus;
  source: ReservationSource;
  tableId?: string;
  specialRequests?: string;
  seatingPreference: SeatingPreference;
  highChairs?: number;
  kidsInParty?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TableStatus = 
  | 'available' 
  | 'reserved' 
  | 'occupied' 
  | 'finishing' 
  | 'blocked';

export type TableShape = 
  | 'circle' 
  | 'square' 
  | 'rectangle' 
  | 'booth';

export interface Table {
  id: string;
  locationId: LocationId;
  number: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  section: string;
  serverId?: string;
  currentReservationId?: string;
  nextReservationId?: string;
  position: { x: number; y: number };
}

export interface WaitlistEntry {
  id: string;
  locationId: LocationId;
  guestName: string;
  guestPhone: string;
  partySize: number;
  quotedWaitTime: number; // minutes
  joinedAt: Date;
  status: 'waiting' | 'notified' | 'seated' | 'expired' | 'cancelled';
  seatingPreference: SeatingPreference;
  specialRequests?: string;
  notifiedAt?: Date;
}

export interface GuestProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[]; // ['VIP', 'Regular', 'Birthday', etc.]
  preferences: {
    seating?: SeatingPreference;
    dietary?: string[];
    notes?: string;
  };
  visitHistory: {
    locationId: LocationId;
    date: Date;
    partySize: number;
    tableId?: string;
    notes?: string;
  }[];
  totalVisits: number;
  lastVisit?: Date;
  createdAt: Date;
}

export interface TableRecommendation {
  table: Table;
  matchScore: number; // 0-100
  reasons: string[];
  warnings?: string[];
}

export interface DashboardMetrics {
  locationId: LocationId;
  date: Date;
  coversToday: number;
  currentlySeated: number;
  upcomingReservations: number;
  waitlistDepth: number;
  tableUtilization: number; // percentage
  averageWaitTime: number; // minutes
}

// SMS Types
export type SMSTemplateType =
  | 'waitlist-ready'
  | 'reservation-confirm'
  | 'reservation-reminder'
  | 'custom';

export interface SMSTemplate {
  id: string;
  locationId: LocationId;
  name: string;
  type: SMSTemplateType;
  template: string; // Uses {{guestName}}, {{partySize}}, {{time}}, etc.
  isDefault: boolean;
}

export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'pending';

export interface NotificationLog {
  id: string;
  locationId: LocationId;
  type: SMSTemplateType;
  phone: string;
  message: string;
  sentAt: Date;
  status: NotificationStatus;
  relatedId?: string; // reservationId or waitlistId
}

// Guest Tags
export interface GuestTag {
  id: string;
  name: string;
  color: string; // hex color
}

// Settings Types
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0

export interface OperatingHours {
  locationId: LocationId;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime: string; // "11:00"
  closeTime: string; // "22:00"
}

export interface BlockedDate {
  id: string;
  locationId: LocationId;
  date: string; // ISO date string "2026-01-29"
  reason: string;
}

export interface FloorSection {
  id: string;
  locationId: LocationId;
  name: string;
  color: string; // hex color
  sortOrder: number;
}

// Analytics Types
export interface TrendData {
  date: string; // ISO date string
  reservations: number;
  covers: number;
  noShows: number;
  walkIns: number;
}

export interface HourlyData {
  hour: number; // 0-23
  utilization: number; // percentage
  reservations: number;
  covers: number;
}

export interface SourceBreakdown {
  source: ReservationSource;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  locationId: LocationId;
  dateRange: { start: Date; end: Date };
  totalCovers: number;
  totalReservations: number;
  averagePartySize: number;
  noShowRate: number;
  peakHours: HourlyData[];
  trendData: TrendData[];
  sourceBreakdown: SourceBreakdown[];
}

// Cross-Location Comparison Types
export interface LocationComparison {
  locationId: LocationId;
  locationName: string;
  metrics: {
    totalReservations: number;
    totalCovers: number;
    noShowRate: number;
    averagePartySize: number;
    tableUtilization: number;
  };
}

export interface ComparisonReport {
  dateRange: { start: string; end: string };
  locations: LocationComparison[];
  combined: {
    totalReservations: number;
    totalCovers: number;
    averageNoShowRate: number;
  };
}

export type ExportFormat = 'csv' | 'json' | 'pdf';

// Floor Plan Layout Types
export interface FloorLayout {
  id: string;
  locationId: LocationId;
  name: string;
  isDefault: boolean;
  tables: {
    tableId: string;
    position: { x: number; y: number };
    rotation?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

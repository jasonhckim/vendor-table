// Mock data for development

import type {
  Reservation,
  Table,
  WaitlistEntry,
  DashboardMetrics,
  GuestProfile,
  GuestTag,
  SMSTemplate,
  OperatingHours,
  BlockedDate,
  FloorSection,
  DayOfWeek,
} from '@/types';

export const mockReservations: Reservation[] = [
  {
    id: '1',
    locationId: 'tustin',
    guestName: 'John Smith',
    guestPhone: '+17145551234',
    guestEmail: 'john@email.com',
    partySize: 4,
    dateTime: new Date(new Date().setHours(18, 30, 0, 0)),
    status: 'confirmed',
    source: 'ios-app',
    specialRequests: 'Birthday celebration, need cake',
    seatingPreference: 'inside',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    locationId: 'tustin',
    guestName: 'Sarah Jones',
    guestPhone: '+17145555678',
    partySize: 2,
    dateTime: new Date(new Date().setHours(18, 45, 0, 0)),
    status: 'pending',
    source: 'phone',
    seatingPreference: 'patio',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    locationId: 'tustin',
    guestName: 'Maria Garcia',
    guestPhone: '+17145559012',
    guestEmail: 'maria@email.com',
    partySize: 6,
    dateTime: new Date(new Date().setHours(19, 0, 0, 0)),
    status: 'confirmed',
    source: 'ios-app',
    seatingPreference: 'inside',
    kidsInParty: 2,
    highChairs: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    locationId: 'tustin',
    guestName: 'David Lee',
    guestPhone: '+17145553456',
    partySize: 8,
    dateTime: new Date(new Date().setHours(19, 30, 0, 0)),
    status: 'confirmed',
    source: 'web',
    specialRequests: 'Anniversary dinner',
    seatingPreference: 'inside',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockTables: Table[] = [
  { id: '1', locationId: 'tustin', number: '1', capacity: 2, shape: 'circle', status: 'available', section: 'Main Dining', position: { x: 100, y: 100 } },
  { id: '2', locationId: 'tustin', number: '2', capacity: 2, shape: 'circle', status: 'available', section: 'Main Dining', position: { x: 200, y: 100 } },
  { id: '3', locationId: 'tustin', number: '3', capacity: 4, shape: 'square', status: 'occupied', section: 'Main Dining', position: { x: 300, y: 100 } },
  { id: '4', locationId: 'tustin', number: '4', capacity: 4, shape: 'square', status: 'reserved', section: 'Main Dining', position: { x: 400, y: 100 }, currentReservationId: '2' },
  { id: '5', locationId: 'tustin', number: '5', capacity: 6, shape: 'rectangle', status: 'available', section: 'Main Dining', position: { x: 100, y: 200 } },
  { id: '6', locationId: 'tustin', number: '6', capacity: 4, shape: 'booth', status: 'finishing', section: 'Main Dining', position: { x: 200, y: 200 }, currentReservationId: '3' },
  { id: '7', locationId: 'tustin', number: '7', capacity: 2, shape: 'circle', status: 'available', section: 'Patio', position: { x: 300, y: 200 } },
  { id: '8', locationId: 'tustin', number: '8', capacity: 4, shape: 'square', status: 'available', section: 'Patio', position: { x: 400, y: 200 } },
];

export const mockWaitlist: WaitlistEntry[] = [
  {
    id: '1',
    locationId: 'tustin',
    guestName: 'Emily Wilson',
    guestPhone: '+17145557890',
    partySize: 3,
    quotedWaitTime: 15,
    joinedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    status: 'waiting',
    seatingPreference: 'any',
  },
  {
    id: '2',
    locationId: 'tustin',
    guestName: 'Robert Brown',
    guestPhone: '+17145551234',
    partySize: 2,
    quotedWaitTime: 20,
    joinedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'waiting',
    seatingPreference: 'bar',
  },
  {
    id: '3',
    locationId: 'tustin',
    guestName: 'Lisa Anderson',
    guestPhone: '+17145555678',
    partySize: 4,
    quotedWaitTime: 25,
    joinedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    status: 'waiting',
    seatingPreference: 'patio',
    specialRequests: 'Celebrating graduation',
  },
];

export const mockMetrics: DashboardMetrics = {
  locationId: 'tustin',
  date: new Date(),
  coversToday: 45,
  currentlySeated: 12,
  upcomingReservations: 8,
  waitlistDepth: 3,
  tableUtilization: 68,
  averageWaitTime: 18,
};

// Guest Profiles
export const mockGuestProfiles: GuestProfile[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+17145551234',
    email: 'john@email.com',
    tags: ['VIP', 'Regular'],
    preferences: {
      seating: 'patio',
      dietary: ['No shellfish'],
      notes: 'Prefers spicy dishes, always orders the ribeye',
    },
    visitHistory: [
      { locationId: 'tustin', date: new Date('2026-01-25'), partySize: 2, tableId: '3' },
      { locationId: 'tustin', date: new Date('2026-01-18'), partySize: 4, tableId: '5' },
      { locationId: 'tustin', date: new Date('2026-01-10'), partySize: 2, tableId: '1' },
    ],
    totalVisits: 24,
    lastVisit: new Date('2026-01-25'),
    createdAt: new Date('2024-06-15'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+17145555678',
    email: 'sarah@email.com',
    tags: ['Birthday'],
    preferences: {
      seating: 'inside',
      dietary: ['Vegetarian'],
      notes: 'Celebrating birthday in February',
    },
    visitHistory: [
      { locationId: 'tustin', date: new Date('2026-01-20'), partySize: 4, tableId: '4' },
    ],
    totalVisits: 8,
    lastVisit: new Date('2026-01-20'),
    createdAt: new Date('2025-03-10'),
  },
  {
    id: '3',
    name: 'Maria Garcia',
    phone: '+17145559012',
    email: 'maria@email.com',
    tags: ['Regular', 'Family'],
    preferences: {
      seating: 'inside',
      dietary: [],
      notes: 'Usually brings 2 kids, needs high chairs',
    },
    visitHistory: [
      { locationId: 'tustin', date: new Date('2026-01-28'), partySize: 4, tableId: '5' },
      { locationId: 'tustin', date: new Date('2026-01-15'), partySize: 5, tableId: '5' },
    ],
    totalVisits: 15,
    lastVisit: new Date('2026-01-28'),
    createdAt: new Date('2024-09-20'),
  },
  {
    id: '4',
    name: 'David Lee',
    phone: '+17145553456',
    email: 'david@email.com',
    tags: ['VIP', 'Anniversary'],
    preferences: {
      seating: 'inside',
      dietary: ['Gluten-free'],
      notes: 'Anniversary dinner regular, always requests quiet table',
    },
    visitHistory: [
      { locationId: 'tustin', date: new Date('2026-01-22'), partySize: 2, tableId: '6' },
    ],
    totalVisits: 12,
    lastVisit: new Date('2026-01-22'),
    createdAt: new Date('2024-11-05'),
  },
  {
    id: '5',
    name: 'Emily Chen',
    phone: '+17145557777',
    email: 'emily@email.com',
    tags: ['Regular'],
    preferences: {
      seating: 'bar',
      dietary: [],
      notes: 'Prefers bar seating for quick lunches',
    },
    visitHistory: [
      { locationId: 'tustin', date: new Date('2026-01-27'), partySize: 1, tableId: '1' },
    ],
    totalVisits: 20,
    lastVisit: new Date('2026-01-27'),
    createdAt: new Date('2024-08-12'),
  },
];

// Default Guest Tags
export const defaultGuestTags: GuestTag[] = [
  { id: '1', name: 'VIP', color: '#F59E0B' },
  { id: '2', name: 'Regular', color: '#3B82F6' },
  { id: '3', name: 'Birthday', color: '#EC4899' },
  { id: '4', name: 'Anniversary', color: '#8B5CF6' },
  { id: '5', name: 'Family', color: '#10B981' },
  { id: '6', name: 'Business', color: '#6B7280' },
  { id: '7', name: 'First Time', color: '#06B6D4' },
];

// SMS Templates
export const mockSMSTemplates: SMSTemplate[] = [
  {
    id: '1',
    locationId: 'tustin',
    name: 'Table Ready',
    type: 'waitlist-ready',
    template: 'Hi {{guestName}}! Your table for {{partySize}} is ready at I Can Barbecue Tustin. Please check in with the host within 10 minutes.',
    isDefault: true,
  },
  {
    id: '2',
    locationId: 'tustin',
    name: 'Reservation Confirmed',
    type: 'reservation-confirm',
    template: 'Your reservation at I Can Barbecue Tustin is confirmed for {{date}} at {{time}} for {{partySize}} guests. See you soon!',
    isDefault: true,
  },
  {
    id: '3',
    locationId: 'tustin',
    name: 'Reminder',
    type: 'reservation-reminder',
    template: 'Reminder: You have a reservation at I Can Barbecue Tustin today at {{time}} for {{partySize}} guests. Reply CANCEL to cancel.',
    isDefault: true,
  },
  {
    id: '4',
    locationId: 'santa-ana',
    name: 'Table Ready',
    type: 'waitlist-ready',
    template: 'Hi {{guestName}}! Your table for {{partySize}} is ready at I Can Barbecue Santa Ana. Please check in with the host within 10 minutes.',
    isDefault: true,
  },
  {
    id: '5',
    locationId: 'santa-ana',
    name: 'Reservation Confirmed',
    type: 'reservation-confirm',
    template: 'Your reservation at I Can Barbecue Santa Ana is confirmed for {{date}} at {{time}} for {{partySize}} guests. See you soon!',
    isDefault: true,
  },
  {
    id: '6',
    locationId: 'santa-ana',
    name: 'Reminder',
    type: 'reservation-reminder',
    template: 'Reminder: You have a reservation at I Can Barbecue Santa Ana today at {{time}} for {{partySize}} guests. Reply CANCEL to cancel.',
    isDefault: true,
  },
];

// Operating Hours (for both locations)
const createHoursForLocation = (locationId: 'tustin' | 'santa-ana'): OperatingHours[] => [
  { locationId, dayOfWeek: 0 as DayOfWeek, isOpen: true, openTime: '11:00', closeTime: '21:00' }, // Sunday
  { locationId, dayOfWeek: 1 as DayOfWeek, isOpen: true, openTime: '11:00', closeTime: '21:00' }, // Monday
  { locationId, dayOfWeek: 2 as DayOfWeek, isOpen: true, openTime: '11:00', closeTime: '21:00' }, // Tuesday
  { locationId, dayOfWeek: 3 as DayOfWeek, isOpen: true, openTime: '11:00', closeTime: '21:00' }, // Wednesday
  { locationId, dayOfWeek: 4 as DayOfWeek, isOpen: true, openTime: '11:00', closeTime: '22:00' }, // Thursday
  { locationId, dayOfWeek: 5 as DayOfWeek, isOpen: true, openTime: '11:00', closeTime: '23:00' }, // Friday
  { locationId, dayOfWeek: 6 as DayOfWeek, isOpen: true, openTime: '11:00', closeTime: '23:00' }, // Saturday
];

export const mockOperatingHours: OperatingHours[] = [
  ...createHoursForLocation('tustin'),
  ...createHoursForLocation('santa-ana'),
];

// Blocked Dates
export const mockBlockedDates: BlockedDate[] = [
  { id: '1', locationId: 'tustin', date: '2026-12-25', reason: 'Christmas Day - Closed' },
  { id: '2', locationId: 'tustin', date: '2026-01-01', reason: 'New Year\'s Day - Closed' },
  { id: '3', locationId: 'santa-ana', date: '2026-12-25', reason: 'Christmas Day - Closed' },
  { id: '4', locationId: 'santa-ana', date: '2026-01-01', reason: 'New Year\'s Day - Closed' },
];

// Floor Sections
export const mockFloorSections: FloorSection[] = [
  { id: '1', locationId: 'tustin', name: 'Main Dining', color: '#3B82F6', sortOrder: 1 },
  { id: '2', locationId: 'tustin', name: 'Patio', color: '#10B981', sortOrder: 2 },
  { id: '3', locationId: 'tustin', name: 'Bar', color: '#F59E0B', sortOrder: 3 },
  { id: '4', locationId: 'santa-ana', name: 'Main Dining', color: '#3B82F6', sortOrder: 1 },
  { id: '5', locationId: 'santa-ana', name: 'Private Room', color: '#8B5CF6', sortOrder: 2 },
];

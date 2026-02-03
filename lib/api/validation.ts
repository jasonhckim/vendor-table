import { z } from 'zod';

// Location ID validation
export const locationIdSchema = z.enum(['tustin', 'santa-ana']);

// Reservation schemas
export const reservationSchema = z.object({
  locationId: locationIdSchema,
  guestName: z.string().min(1, 'Guest name is required').max(100),
  guestPhone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  guestEmail: z.string().email().optional().nullable(),
  partySize: z.number().int().min(1, 'Party size must be at least 1').max(20),
  dateTime: z.string().datetime({ message: 'Invalid datetime format' }),
  seatingPreference: z.enum(['any', 'inside', 'patio', 'bar']).default('any'),
  specialRequests: z.string().max(500).optional().nullable(),
  source: z.enum(['ios-app', 'phone', 'walk-in', 'web']).default('web'),
  tableId: z.string().optional().nullable(),
});

export const reservationUpdateSchema = reservationSchema.partial().extend({
  status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'no-show', 'cancelled']).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type ReservationUpdateInput = z.infer<typeof reservationUpdateSchema>;

// Table schemas
export const tableSchema = z.object({
  locationId: locationIdSchema,
  number: z.string().min(1, 'Table number is required').max(10),
  capacity: z.number().int().min(1).max(20),
  shape: z.enum(['circle', 'square', 'rectangle', 'booth']),
  section: z.string().min(1, 'Section is required'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  status: z.enum(['available', 'reserved', 'occupied', 'finishing', 'blocked']).default('available'),
});

export const tableUpdateSchema = tableSchema.partial();

export type TableInput = z.infer<typeof tableSchema>;
export type TableUpdateInput = z.infer<typeof tableUpdateSchema>;

// Guest schemas
export const guestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional().nullable(),
  tags: z.array(z.string()).default([]),
  preferences: z.object({
    seating: z.enum(['inside', 'bar', 'patio', 'any']).optional(),
    dietary: z.array(z.string()).optional(),
    notes: z.string().max(500).optional(),
  }).default({}),
});

export const guestUpdateSchema = guestSchema.partial();

export type GuestInput = z.infer<typeof guestSchema>;
export type GuestUpdateInput = z.infer<typeof guestUpdateSchema>;

// Waitlist schemas
export const waitlistSchema = z.object({
  locationId: locationIdSchema,
  guestName: z.string().min(1, 'Guest name is required').max(100),
  guestPhone: z.string().min(10).max(20),
  partySize: z.number().int().min(1).max(20),
  quotedWaitTime: z.number().int().min(0).max(180),
  seatingPreference: z.enum(['any', 'inside', 'patio', 'bar']).default('any'),
  specialRequests: z.string().max(500).optional().nullable(),
});

export const waitlistUpdateSchema = waitlistSchema.partial().extend({
  status: z.enum(['waiting', 'notified', 'seated', 'expired', 'cancelled']).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type WaitlistUpdateInput = z.infer<typeof waitlistUpdateSchema>;

// Analytics query params
export const analyticsQuerySchema = z.object({
  locationId: locationIdSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

// Export format schema
export const exportFormatSchema = z.enum(['csv', 'json']);
export type ExportFormat = z.infer<typeof exportFormatSchema>;

// Webhook schema
export const webhookPayloadSchema = z.object({
  event: z.string(),
  data: z.record(z.string(), z.unknown()),
  timestamp: z.string().datetime().optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

// Query params helpers
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

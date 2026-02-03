import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  validateBody,
  validateQuery,
  withErrorHandling,
  handleCors,
} from '@/lib/api/middleware';
import {
  waitlistSchema,
  waitlistUpdateSchema,
  locationIdSchema,
  paginationSchema,
} from '@/lib/api/validation';

// Query params for listing waitlist entries
const listQuerySchema = z.object({
  locationId: locationIdSchema.optional(),
  status: z.enum(['waiting', 'notified', 'seated', 'expired', 'cancelled']).optional(),
}).merge(paginationSchema);

// GET /api/waitlist - List waitlist entries
export const GET = withErrorHandling(async (request: NextRequest) => {
  const validation = validateQuery(request, listQuerySchema);
  if (validation.error) return validation.error;

  const { locationId, status, page, limit } = validation.data;

  // In production, this would query a database
  const mockWaitlist = {
    entries: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
    filters: {
      locationId,
      status,
    },
  };

  return successResponse(mockWaitlist);
});

// POST /api/waitlist - Add to waitlist
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateBody(request, waitlistSchema);
  if (validation.error) return validation.error;

  const waitlistData = validation.data;

  // In production, this would save to database
  const newEntry = {
    id: crypto.randomUUID(),
    ...waitlistData,
    status: 'waiting',
    joinedAt: new Date().toISOString(),
  };

  return successResponse(newEntry, 201);
});

// PATCH /api/waitlist - Update waitlist entry by ID in body
export const PATCH = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { id, ...updateData } = body;

  if (!id) {
    return errorResponse('Entry ID is required', 400);
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid entry ID format', 400);
  }

  const validation = waitlistUpdateSchema.safeParse(updateData);
  if (!validation.success) {
    return errorResponse('Validation failed', 400);
  }

  // In production, this would update the database
  const updatedEntry = {
    id,
    ...validation.data,
    updatedAt: new Date().toISOString(),
  };

  return successResponse(updatedEntry);
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

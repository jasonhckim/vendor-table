import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  successResponse,
  validateBody,
  validateQuery,
  withErrorHandling,
  handleCors,
} from '@/lib/api/middleware';
import {
  guestSchema,
  paginationSchema,
} from '@/lib/api/validation';

// Query params for listing guests
const listQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
}).merge(paginationSchema);

// GET /api/guests - List guests
export const GET = withErrorHandling(async (request: NextRequest) => {
  const validation = validateQuery(request, listQuerySchema);
  if (validation.error) return validation.error;

  const { search, tag, page, limit } = validation.data;

  // In production, this would query a database
  const mockGuests = {
    guests: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
    filters: {
      search,
      tag,
    },
  };

  return successResponse(mockGuests);
});

// POST /api/guests - Create guest profile
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateBody(request, guestSchema);
  if (validation.error) return validation.error;

  const guestData = validation.data;

  // In production, this would save to database
  const newGuest = {
    id: crypto.randomUUID(),
    ...guestData,
    totalVisits: 0,
    visitHistory: [],
    createdAt: new Date().toISOString(),
  };

  return successResponse(newGuest, 201);
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

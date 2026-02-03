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
  reservationSchema,
  locationIdSchema,
  paginationSchema,
} from '@/lib/api/validation';

// Query params for listing reservations
const listQuerySchema = z.object({
  locationId: locationIdSchema.optional(),
  date: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'seated', 'completed', 'no-show', 'cancelled']).optional(),
}).merge(paginationSchema);

// GET /api/reservations - List reservations
export const GET = withErrorHandling(async (request: NextRequest) => {
  const validation = validateQuery(request, listQuerySchema);
  if (validation.error) return validation.error;

  const { locationId, date, status, page, limit } = validation.data;

  // In production, this would query a database
  // For now, return mock structure
  const mockReservations = {
    reservations: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
    filters: {
      locationId,
      date,
      status,
    },
  };

  return successResponse(mockReservations);
});

// POST /api/reservations - Create reservation
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateBody(request, reservationSchema);
  if (validation.error) return validation.error;

  const reservationData = validation.data;

  // In production, this would save to database
  const newReservation = {
    id: crypto.randomUUID(),
    ...reservationData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return successResponse(newReservation, 201);
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

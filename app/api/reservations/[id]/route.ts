import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validateBody,
  withErrorHandling,
  handleCors,
} from '@/lib/api/middleware';
import { reservationUpdateSchema } from '@/lib/api/validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/reservations/[id] - Get single reservation
export const GET = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid reservation ID format', 400);
  }

  // In production, this would query the database
  // For now, return not found since we don't have persistence
  return errorResponse('Reservation not found', 404);
});

// PUT /api/reservations/[id] - Update reservation
export const PUT = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid reservation ID format', 400);
  }

  const validation = await validateBody(request, reservationUpdateSchema);
  if (validation.error) return validation.error;

  const updateData = validation.data;

  // In production, this would update the database
  const updatedReservation = {
    id,
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  return successResponse(updatedReservation);
});

// DELETE /api/reservations/[id] - Delete/cancel reservation
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid reservation ID format', 400);
  }

  // In production, this would delete/cancel in database
  return successResponse({ message: 'Reservation cancelled', id });
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

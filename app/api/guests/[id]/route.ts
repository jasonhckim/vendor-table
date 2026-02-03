import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validateBody,
  withErrorHandling,
  handleCors,
} from '@/lib/api/middleware';
import { guestUpdateSchema } from '@/lib/api/validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/guests/[id] - Get single guest profile
export const GET = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid guest ID format', 400);
  }

  // In production, this would query the database
  return errorResponse('Guest not found', 404);
});

// PUT /api/guests/[id] - Update guest profile
export const PUT = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid guest ID format', 400);
  }

  const validation = await validateBody(request, guestUpdateSchema);
  if (validation.error) return validation.error;

  const updateData = validation.data;

  // In production, this would update the database
  const updatedGuest = {
    id,
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  return successResponse(updatedGuest);
});

// DELETE /api/guests/[id] - Delete guest profile
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid guest ID format', 400);
  }

  // In production, this would delete from database
  return successResponse({ message: 'Guest profile deleted', id });
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

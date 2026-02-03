import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validateBody,
  withErrorHandling,
  handleCors,
} from '@/lib/api/middleware';
import { tableUpdateSchema } from '@/lib/api/validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/tables/[id] - Get single table
export const GET = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid table ID format', 400);
  }

  // In production, this would query the database
  return errorResponse('Table not found', 404);
});

// PUT /api/tables/[id] - Update table
export const PUT = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid table ID format', 400);
  }

  const validation = await validateBody(request, tableUpdateSchema);
  if (validation.error) return validation.error;

  const updateData = validation.data;

  // In production, this would update the database
  const updatedTable = {
    id,
    ...updateData,
    updatedAt: new Date().toISOString(),
  };

  return successResponse(updatedTable);
});

// DELETE /api/tables/[id] - Delete table
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  context: RouteContext
) => {
  const { id } = await context.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return errorResponse('Invalid table ID format', 400);
  }

  // In production, this would delete from database
  return successResponse({ message: 'Table deleted', id });
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

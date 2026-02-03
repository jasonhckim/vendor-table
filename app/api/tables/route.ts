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
  tableSchema,
  locationIdSchema,
  paginationSchema,
} from '@/lib/api/validation';

// Query params for listing tables
const listQuerySchema = z.object({
  locationId: locationIdSchema.optional(),
  section: z.string().optional(),
  status: z.enum(['available', 'reserved', 'occupied', 'finishing', 'blocked']).optional(),
}).merge(paginationSchema);

// GET /api/tables - List tables
export const GET = withErrorHandling(async (request: NextRequest) => {
  const validation = validateQuery(request, listQuerySchema);
  if (validation.error) return validation.error;

  const { locationId, section, status, page, limit } = validation.data;

  // In production, this would query a database
  const mockTables = {
    tables: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
    filters: {
      locationId,
      section,
      status,
    },
  };

  return successResponse(mockTables);
});

// POST /api/tables - Create table
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateBody(request, tableSchema);
  if (validation.error) return validation.error;

  const tableData = validation.data;

  // In production, this would save to database
  const newTable = {
    id: crypto.randomUUID(),
    ...tableData,
    createdAt: new Date().toISOString(),
  };

  return successResponse(newTable, 201);
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

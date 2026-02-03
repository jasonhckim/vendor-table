import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  errorResponse,
  validateQuery,
  withErrorHandling,
  handleCors,
} from '@/lib/api/middleware';
import { locationIdSchema, exportFormatSchema } from '@/lib/api/validation';

// Query params for export
const exportQuerySchema = z.object({
  locationId: locationIdSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: exportFormatSchema.default('csv'),
});

// Helper to convert data to CSV
function toCSV(data: Record<string, unknown>[], headers: string[]): string {
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// GET /api/analytics/export - Export analytics data
export const GET = withErrorHandling(async (request: NextRequest) => {
  const validation = validateQuery(request, exportQuerySchema);
  if (validation.error) return validation.error;

  const { locationId, startDate, endDate, format } = validation.data;

  // Parse date range (default to last 7 days)
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  // In production, this would query the database
  // Mock data for export
  const exportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      locationId: locationId || 'all',
    },
    summary: {
      totalReservations: 0,
      totalCovers: 0,
      averagePartySize: 0,
      noShowRate: 0,
    },
    dailyData: [] as Array<{
      date: string;
      reservations: number;
      covers: number;
      noShows: number;
      walkIns: number;
    }>,
  };

  if (format === 'json') {
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="analytics-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.json"`,
      },
    });
  }

  // CSV format
  const headers = ['date', 'reservations', 'covers', 'noShows', 'walkIns'];
  const csvContent = toCSV(exportData.dailyData, headers);

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="analytics-${start.toISOString().split('T')[0]}-${end.toISOString().split('T')[0]}.csv"`,
    },
  });
});

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

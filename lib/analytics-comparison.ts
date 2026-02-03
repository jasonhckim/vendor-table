// Cross-location analytics comparison utilities

import type {
  Reservation,
  Table,
  LocationId,
  TrendData,
} from '@/types';
import {
  calculateTotalCovers,
  calculateAveragePartySize,
  calculateNoShowRate,
  calculateTableUtilization,
  calculateTrendData,
} from './analytics';
import { format, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval } from 'date-fns';

// Types for cross-location comparison
export interface LocationMetrics {
  locationId: LocationId;
  locationName: string;
  metrics: {
    totalReservations: number;
    totalCovers: number;
    noShowRate: number;
    averagePartySize: number;
    tableUtilization: number;
    walkInRate: number;
  };
}

export interface ComparisonReport {
  dateRange: { start: string; end: string };
  locations: LocationMetrics[];
  combined: {
    totalReservations: number;
    totalCovers: number;
    averageNoShowRate: number;
    averageUtilization: number;
  };
  trends: {
    locationId: LocationId;
    data: TrendData[];
  }[];
}

export type ExportFormat = 'csv' | 'json';

// Location name mapping
const LOCATION_NAMES: Record<LocationId, string> = {
  'tustin': 'Tustin',
  'santa-ana': 'Santa Ana',
};

/**
 * Filter reservations by date range
 */
export function filterByDateRange(
  reservations: Reservation[],
  startDate: Date,
  endDate: Date
): Reservation[] {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  return reservations.filter((r) => {
    const resDate = new Date(r.dateTime);
    return isWithinInterval(resDate, { start, end });
  });
}

/**
 * Calculate metrics for a single location
 */
export function calculateLocationMetrics(
  reservations: Reservation[],
  tables: Table[],
  locationId: LocationId,
  dateRange: { start: Date; end: Date }
): LocationMetrics {
  const locationReservations = filterByDateRange(
    reservations.filter((r) => r.locationId === locationId),
    dateRange.start,
    dateRange.end
  );

  const locationTables = tables.filter((t) => t.locationId === locationId);
  const walkIns = locationReservations.filter((r) => r.source === 'walk-in').length;

  return {
    locationId,
    locationName: LOCATION_NAMES[locationId],
    metrics: {
      totalReservations: locationReservations.length,
      totalCovers: calculateTotalCovers(locationReservations),
      noShowRate: calculateNoShowRate(locationReservations),
      averagePartySize: calculateAveragePartySize(locationReservations),
      tableUtilization: calculateTableUtilization(locationTables),
      walkInRate: locationReservations.length > 0
        ? Math.round((walkIns / locationReservations.length) * 100)
        : 0,
    },
  };
}

/**
 * Calculate location comparison report
 */
export function calculateLocationComparison(
  reservations: Reservation[],
  tables: Table[],
  locationIds: LocationId[],
  dateRange: { start: Date; end: Date }
): ComparisonReport {
  // Calculate metrics for each location
  const locations = locationIds.map((locationId) =>
    calculateLocationMetrics(reservations, tables, locationId, dateRange)
  );

  // Calculate combined metrics
  const totalReservations = locations.reduce((sum, loc) => sum + loc.metrics.totalReservations, 0);
  const totalCovers = locations.reduce((sum, loc) => sum + loc.metrics.totalCovers, 0);
  const averageNoShowRate = locations.length > 0
    ? Math.round(locations.reduce((sum, loc) => sum + loc.metrics.noShowRate, 0) / locations.length)
    : 0;
  const averageUtilization = locations.length > 0
    ? Math.round(locations.reduce((sum, loc) => sum + loc.metrics.tableUtilization, 0) / locations.length)
    : 0;

  // Calculate trend data for each location
  const trends = locationIds.map((locationId) => ({
    locationId,
    data: calculateTrendDataForRange(
      reservations.filter((r) => r.locationId === locationId),
      dateRange.start,
      dateRange.end
    ),
  }));

  return {
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
    locations,
    combined: {
      totalReservations,
      totalCovers,
      averageNoShowRate,
      averageUtilization,
    },
    trends,
  };
}

/**
 * Calculate trend data for a specific date range
 */
function calculateTrendDataForRange(
  reservations: Reservation[],
  startDate: Date,
  endDate: Date
): TrendData[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayReservations = reservations.filter((r) => {
      const resDate = new Date(r.dateTime);
      return isWithinInterval(resDate, { start: dayStart, end: dayEnd });
    });

    return {
      date: format(day, 'yyyy-MM-dd'),
      reservations: dayReservations.length,
      covers: calculateTotalCovers(dayReservations),
      noShows: dayReservations.filter((r) => r.status === 'no-show').length,
      walkIns: dayReservations.filter((r) => r.source === 'walk-in').length,
    };
  });
}

/**
 * Export comparison data to CSV format
 */
export function exportToCSV(data: ComparisonReport): string {
  const lines: string[] = [];

  // Header
  lines.push('Cross-Location Comparison Report');
  lines.push(`Date Range: ${data.dateRange.start.split('T')[0]} to ${data.dateRange.end.split('T')[0]}`);
  lines.push('');

  // Location comparison
  lines.push('Location,Reservations,Covers,No-Show Rate,Avg Party Size,Table Utilization,Walk-In Rate');
  for (const loc of data.locations) {
    lines.push([
      loc.locationName,
      loc.metrics.totalReservations,
      loc.metrics.totalCovers,
      `${loc.metrics.noShowRate}%`,
      loc.metrics.averagePartySize.toFixed(1),
      `${loc.metrics.tableUtilization}%`,
      `${loc.metrics.walkInRate}%`,
    ].join(','));
  }

  // Combined totals
  lines.push('');
  lines.push('Combined Totals');
  lines.push(`Total Reservations,${data.combined.totalReservations}`);
  lines.push(`Total Covers,${data.combined.totalCovers}`);
  lines.push(`Average No-Show Rate,${data.combined.averageNoShowRate}%`);
  lines.push(`Average Utilization,${data.combined.averageUtilization}%`);

  // Daily trends per location
  lines.push('');
  lines.push('Daily Trends by Location');

  for (const trend of data.trends) {
    const locationName = LOCATION_NAMES[trend.locationId];
    lines.push('');
    lines.push(`${locationName} Daily Data`);
    lines.push('Date,Reservations,Covers,No-Shows,Walk-Ins');

    for (const day of trend.data) {
      lines.push([
        day.date,
        day.reservations,
        day.covers,
        day.noShows,
        day.walkIns,
      ].join(','));
    }
  }

  return lines.join('\n');
}

/**
 * Export comparison data to JSON format
 */
export function exportToJSON(data: ComparisonReport): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Export analytics data in specified format
 */
export function exportAnalytics(
  data: ComparisonReport,
  format: ExportFormat
): Blob {
  if (format === 'json') {
    const jsonContent = exportToJSON(data);
    return new Blob([jsonContent], { type: 'application/json' });
  }

  const csvContent = exportToCSV(data);
  return new Blob([csvContent], { type: 'text/csv' });
}

/**
 * Generate filename for export
 */
export function getExportFilename(
  dateRange: { start: string; end: string },
  format: ExportFormat
): string {
  const startStr = dateRange.start.split('T')[0];
  const endStr = dateRange.end.split('T')[0];
  return `analytics-comparison-${startStr}-to-${endStr}.${format}`;
}

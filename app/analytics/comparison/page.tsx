'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { useTableStore } from '@/lib/stores/table-store';
import { LocationComparison } from '@/components/analytics/location-comparison';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import { ExportDialog } from '@/components/analytics/export-dialog';
import {
  calculateLocationComparison,
  exportAnalytics,
  getExportFilename,
  type ExportFormat,
} from '@/lib/analytics-comparison';
import { subDays } from 'date-fns';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import type { LocationId } from '@/types';

export default function ComparisonPage() {
  // Date range state
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 6));
  const [endDate, setEndDate] = useState(() => new Date());
  const [isExporting, setIsExporting] = useState(false);

  // Get data from stores
  const reservations = useReservationStore((state) => state.reservations);
  const tables = useTableStore((state) => state.tables);

  // Calculate comparison report
  const comparisonReport = useMemo(() => {
    const locationIds: LocationId[] = ['tustin', 'santa-ana'];
    return calculateLocationComparison(
      reservations,
      tables,
      locationIds,
      { start: startDate, end: endDate }
    );
  }, [reservations, tables, startDate, endDate]);

  // Handle date change
  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Handle export
  const handleExport = (format: ExportFormat) => {
    setIsExporting(true);

    try {
      const blob = exportAnalytics(comparisonReport, format);
      const filename = getExportFilename(comparisonReport.dateRange, format);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/analytics">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Location Comparison</h1>
            <p className="text-muted-foreground">
              Compare performance across all locations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
          <ExportDialog onExport={handleExport} isExporting={isExporting} />
        </div>
      </div>

      {/* Quick Stats Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Comparing</p>
              <p className="text-lg font-semibold">
                {comparisonReport.locations.map((l) => l.locationName).join(' vs ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date Range</p>
              <p className="text-lg font-semibold">
                {new Date(comparisonReport.dateRange.start).toLocaleDateString()} - {new Date(comparisonReport.dateRange.end).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Content */}
      <LocationComparison report={comparisonReport} />
    </div>
  );
}

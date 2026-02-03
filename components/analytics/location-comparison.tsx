'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ComparisonReport } from '@/lib/analytics-comparison';
import {
  Users,
  Calendar,
  Percent,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from 'lucide-react';

interface LocationComparisonProps {
  report: ComparisonReport;
}

export function LocationComparison({ report }: LocationComparisonProps) {
  const { locations, combined, trends } = report;

  // Calculate which location is leading in each metric
  const getLeader = (metric: keyof typeof locations[0]['metrics']) => {
    if (locations.length < 2) return null;
    const [loc1, loc2] = locations;
    if (loc1.metrics[metric] === loc2.metrics[metric]) return 'tie';
    return loc1.metrics[metric] > loc2.metrics[metric] ? loc1.locationId : loc2.locationId;
  };

  // Get comparison indicator
  const getIndicator = (
    value1: number,
    value2: number,
    higherIsBetter = true
  ) => {
    const diff = value1 - value2;
    if (diff === 0) return { icon: Minus, color: 'text-gray-500', label: 'Same' };
    const isPositive = higherIsBetter ? diff > 0 : diff < 0;
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      label: `${Math.abs(diff).toFixed(1)}${typeof value1 === 'number' && value1 < 100 ? '%' : ''} ${isPositive ? 'higher' : 'lower'}`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Location Cards Side by Side */}
      <div className="grid gap-4 md:grid-cols-2">
        {locations.map((location) => (
          <Card
            key={location.locationId}
            className={cn(
              'border-l-4',
              location.locationId === 'tustin' ? 'border-l-blue-500' : 'border-l-green-500'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{location.locationName}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn(
                    location.locationId === 'tustin'
                      ? 'border-blue-500 text-blue-700'
                      : 'border-green-500 text-green-700'
                  )}
                >
                  {location.locationId}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <MetricItem
                  icon={Calendar}
                  label="Reservations"
                  value={location.metrics.totalReservations}
                  isLeading={getLeader('totalReservations') === location.locationId}
                />
                <MetricItem
                  icon={Users}
                  label="Covers"
                  value={location.metrics.totalCovers}
                  isLeading={getLeader('totalCovers') === location.locationId}
                />
                <MetricItem
                  icon={Percent}
                  label="No-Show Rate"
                  value={`${location.metrics.noShowRate}%`}
                  isLeading={getLeader('noShowRate') !== location.locationId} // Lower is better
                  lowerIsBetter
                />
                <MetricItem
                  icon={BarChart3}
                  label="Utilization"
                  value={`${location.metrics.tableUtilization}%`}
                  isLeading={getLeader('tableUtilization') === location.locationId}
                />
              </div>

              {/* Additional Stats */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Party Size</span>
                  <span className="font-medium">{location.metrics.averagePartySize.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Walk-In Rate</span>
                  <span className="font-medium">{location.metrics.walkInRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Combined Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Combined Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{combined.totalReservations}</p>
              <p className="text-xs text-muted-foreground">Total Reservations</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{combined.totalCovers}</p>
              <p className="text-xs text-muted-foreground">Total Covers</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{combined.averageNoShowRate}%</p>
              <p className="text-xs text-muted-foreground">Avg No-Show Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{combined.averageUtilization}%</p>
              <p className="text-xs text-muted-foreground">Avg Utilization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Covers per day for each location
          </p>
        </CardHeader>
        <CardContent>
          <TrendChart trends={trends} />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for metric items
function MetricItem({
  icon: Icon,
  label,
  value,
  isLeading,
  lowerIsBetter = false,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  isLeading: boolean;
  lowerIsBetter?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
        {isLeading && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            {lowerIsBetter ? 'Best' : 'Leading'}
          </Badge>
        )}
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// Simple bar chart for trends
function TrendChart({
  trends,
}: {
  trends: { locationId: string; data: { date: string; covers: number }[] }[];
}) {
  if (trends.length === 0 || !trends[0].data.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No trend data available
      </p>
    );
  }

  // Find max covers for scaling
  const maxCovers = Math.max(
    ...trends.flatMap((t) => t.data.map((d) => d.covers)),
    1
  );

  const colors = {
    tustin: 'bg-blue-500',
    'santa-ana': 'bg-green-500',
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex gap-4 justify-center">
        {trends.map((trend) => (
          <div key={trend.locationId} className="flex items-center gap-2">
            <div
              className={cn(
                'h-3 w-3 rounded',
                colors[trend.locationId as keyof typeof colors] || 'bg-gray-500'
              )}
            />
            <span className="text-sm capitalize">{trend.locationId.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-40 gap-1">
        {trends[0].data.map((_, dayIndex) => (
          <div
            key={dayIndex}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <div className="w-full flex justify-center items-end gap-[2px] h-32">
              {trends.map((trend) => {
                const dayData = trend.data[dayIndex];
                const height = (dayData.covers / maxCovers) * 100;

                return (
                  <div
                    key={trend.locationId}
                    className={cn(
                      'flex-1 max-w-6 rounded-t transition-all',
                      colors[trend.locationId as keyof typeof colors] || 'bg-gray-500'
                    )}
                    style={{
                      height: `${height}%`,
                      minHeight: dayData.covers > 0 ? '4px' : '0',
                    }}
                    title={`${trend.locationId}: ${dayData.covers} covers`}
                  />
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(trends[0].data[dayIndex].date).toLocaleDateString('en-US', {
                weekday: 'short',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

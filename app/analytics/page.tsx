'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocationStore } from '@/lib/store';
import { useReservationStore } from '@/lib/stores/reservation-store';
import { useTableStore } from '@/lib/stores/table-store';
import { useWaitlistStore } from '@/lib/stores/waitlist-store';
import {
  calculateAnalytics,
  formatHour,
} from '@/lib/analytics';
import {
  Users,
  Calendar,
  Clock,
  Percent,
  BarChart3,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const sourceConfig = {
  'ios-app': { label: 'iOS App', emoji: '📱', color: 'bg-blue-500' },
  'phone': { label: 'Phone', emoji: '📞', color: 'bg-green-500' },
  'walk-in': { label: 'Walk-in', emoji: '🚶', color: 'bg-purple-500' },
  'web': { label: 'Web', emoji: '🌐', color: 'bg-orange-500' },
};

export default function AnalyticsPage() {
  const { getCurrentLocation } = useLocationStore();
  const location = getCurrentLocation();

  // Get data from stores
  const reservations = useReservationStore((state) => state.reservations);
  const tables = useTableStore((state) => state.tables);
  const waitlistEntries = useWaitlistStore((state) => state.entries);

  // Calculate analytics
  const analytics = calculateAnalytics(reservations, tables, waitlistEntries, location.id);

  // Find peak hours (top 4)
  const peakHours = [...analytics.hourlyData]
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 4);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights for {location.name}
          </p>
        </div>
        <Link href="/analytics/comparison">
          <Button variant="outline" className="gap-2">
            <GitCompare className="h-4 w-4" />
            Compare Locations
          </Button>
        </Link>
      </div>

      {/* Today's Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Covers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayMetrics.totalCovers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.todayMetrics.totalReservations} reservations
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Seated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayMetrics.currentlySeated}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.todayMetrics.tableUtilization}% table utilization
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayMetrics.waitlistDepth}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.todayMetrics.averageWaitTime} min avg wait
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Party Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayMetrics.averagePartySize}</div>
            <p className="text-xs text-muted-foreground">
              guests per reservation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Week Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Week&apos;s Total Covers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.weekMetrics.totalCovers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.weekMetrics.totalReservations} total reservations
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reservation Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {100 - (analytics.sourceBreakdown.find(s => s.source === 'walk-in')?.percentage || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs walk-ins
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "border-l-4",
          analytics.weekMetrics.noShowRate > 10 ? "border-l-red-500" : "border-l-green-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              analytics.weekMetrics.noShowRate > 10 ? "text-red-600" : "text-green-600"
            )}>
              {analytics.weekMetrics.noShowRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.weekMetrics.noShowRate > 10 ? "Above target" : "Below target (10%)"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Reservation Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Reservation Sources</CardTitle>
            <p className="text-sm text-muted-foreground">Last 7 days</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.sourceBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available
              </p>
            ) : (
              analytics.sourceBreakdown.map((source) => {
                const config = sourceConfig[source.source];
                return (
                  <div key={source.source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {config.emoji} {config.label}
                      </span>
                      <span className="text-sm font-bold">{source.percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn('h-full transition-all', config.color)}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <p className="text-sm text-muted-foreground">Busiest times this week</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {peakHours.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available
              </p>
            ) : (
              peakHours.map((hourData) => (
                <div key={hourData.hour} className="flex items-center justify-between text-sm">
                  <span>
                    {formatHour(hourData.hour)} - {formatHour(hourData.hour + 1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full',
                          hourData.utilization >= 90
                            ? 'bg-red-500'
                            : hourData.utilization >= 70
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        )}
                        style={{ width: `${hourData.utilization}%` }}
                      />
                    </div>
                    <span className="font-medium w-12 text-right">{hourData.utilization}%</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Trend */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Daily reservations and covers</p>
        </CardHeader>
        <CardContent>
          {analytics.trendData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No data available
            </p>
          ) : (
            <div className="space-y-4">
              {/* Simple bar chart representation */}
              <div className="flex items-end justify-between h-32 gap-2">
                {analytics.trendData.map((day) => {
                  const maxCovers = Math.max(...analytics.trendData.map((d) => d.covers), 1);
                  const height = (day.covers / maxCovers) * 100;

                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="w-full flex flex-col items-center justify-end h-24">
                        <span className="text-xs font-medium mb-1">{day.covers}</span>
                        <div
                          className="w-full bg-primary rounded-t transition-all"
                          style={{ height: `${height}%`, minHeight: day.covers > 0 ? '4px' : '0' }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {analytics.trendData.reduce((sum, d) => sum + d.reservations, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Reservations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {analytics.trendData.reduce((sum, d) => sum + d.covers, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Covers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.trendData.reduce((sum, d) => sum + d.noShows, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">No-Shows</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.trendData.reduce((sum, d) => sum + d.walkIns, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Walk-Ins</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics calculation utilities

import type {
  Reservation,
  Table,
  WaitlistEntry,
  LocationId,
  ReservationSource,
  TrendData,
  HourlyData,
  SourceBreakdown,
} from '@/types';
import { subDays, startOfDay, endOfDay, format, getHours } from 'date-fns';

/**
 * Calculate total covers (guests) from reservations
 */
export function calculateTotalCovers(reservations: Reservation[]): number {
  return reservations.reduce((sum, r) => sum + r.partySize, 0);
}

/**
 * Calculate average party size
 */
export function calculateAveragePartySize(reservations: Reservation[]): number {
  if (reservations.length === 0) return 0;
  return Math.round((calculateTotalCovers(reservations) / reservations.length) * 10) / 10;
}

/**
 * Calculate no-show rate as percentage
 */
export function calculateNoShowRate(reservations: Reservation[]): number {
  if (reservations.length === 0) return 0;
  const noShows = reservations.filter((r) => r.status === 'no-show').length;
  return Math.round((noShows / reservations.length) * 100);
}

/**
 * Calculate table utilization
 */
export function calculateTableUtilization(tables: Table[]): number {
  if (tables.length === 0) return 0;
  const inUse = tables.filter((t) => t.status === 'occupied' || t.status === 'reserved').length;
  return Math.round((inUse / tables.length) * 100);
}

/**
 * Calculate average wait time from waitlist
 */
export function calculateAverageWaitTime(waitlist: WaitlistEntry[]): number {
  if (waitlist.length === 0) return 0;
  const totalWait = waitlist.reduce((sum, w) => sum + w.quotedWaitTime, 0);
  return Math.round(totalWait / waitlist.length);
}

/**
 * Calculate reservation source breakdown
 */
export function calculateSourceBreakdown(reservations: Reservation[]): SourceBreakdown[] {
  if (reservations.length === 0) return [];

  const sources: ReservationSource[] = ['ios-app', 'phone', 'walk-in', 'web'];
  const counts: Record<ReservationSource, number> = {
    'ios-app': 0,
    'phone': 0,
    'walk-in': 0,
    'web': 0,
  };

  reservations.forEach((r) => {
    counts[r.source]++;
  });

  return sources.map((source) => ({
    source,
    count: counts[source],
    percentage: Math.round((counts[source] / reservations.length) * 100),
  }));
}

/**
 * Calculate hourly utilization data
 */
export function calculateHourlyData(reservations: Reservation[]): HourlyData[] {
  const hourlyStats: Record<number, { reservations: number; covers: number }> = {};

  // Initialize all hours (11 AM to 11 PM typical restaurant hours)
  for (let hour = 11; hour <= 23; hour++) {
    hourlyStats[hour] = { reservations: 0, covers: 0 };
  }

  // Count reservations per hour
  reservations.forEach((r) => {
    const hour = getHours(new Date(r.dateTime));
    if (hourlyStats[hour]) {
      hourlyStats[hour].reservations++;
      hourlyStats[hour].covers += r.partySize;
    }
  });

  // Calculate peak hour for normalization
  const maxReservations = Math.max(
    ...Object.values(hourlyStats).map((s) => s.reservations),
    1
  );

  return Object.entries(hourlyStats)
    .map(([hour, stats]) => ({
      hour: parseInt(hour),
      reservations: stats.reservations,
      covers: stats.covers,
      utilization: Math.round((stats.reservations / maxReservations) * 100),
    }))
    .sort((a, b) => a.hour - b.hour);
}

/**
 * Calculate trend data over the past N days
 */
export function calculateTrendData(
  reservations: Reservation[],
  days: number = 7
): TrendData[] {
  const trends: TrendData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayReservations = reservations.filter((r) => {
      const resDate = new Date(r.dateTime);
      return resDate >= dayStart && resDate <= dayEnd;
    });

    trends.push({
      date: format(date, 'yyyy-MM-dd'),
      reservations: dayReservations.length,
      covers: calculateTotalCovers(dayReservations),
      noShows: dayReservations.filter((r) => r.status === 'no-show').length,
      walkIns: dayReservations.filter((r) => r.source === 'walk-in').length,
    });
  }

  return trends;
}

/**
 * Get reservations for today
 */
export function getTodayReservations(
  reservations: Reservation[],
  locationId: LocationId
): Reservation[] {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  return reservations.filter((r) => {
    const resDate = new Date(r.dateTime);
    return r.locationId === locationId && resDate >= dayStart && resDate <= dayEnd;
  });
}

/**
 * Get reservations for the past week
 */
export function getWeekReservations(
  reservations: Reservation[],
  locationId: LocationId
): Reservation[] {
  const weekAgo = subDays(new Date(), 7);
  const now = new Date();

  return reservations.filter((r) => {
    const resDate = new Date(r.dateTime);
    return r.locationId === locationId && resDate >= weekAgo && resDate <= now;
  });
}

/**
 * Calculate full analytics data for a location
 */
export function calculateAnalytics(
  reservations: Reservation[],
  tables: Table[],
  waitlist: WaitlistEntry[],
  locationId: LocationId
): {
  todayMetrics: {
    totalReservations: number;
    totalCovers: number;
    averagePartySize: number;
    currentlySeated: number;
    tableUtilization: number;
    waitlistDepth: number;
    averageWaitTime: number;
  };
  weekMetrics: {
    totalReservations: number;
    totalCovers: number;
    noShowRate: number;
    averagePartySize: number;
  };
  sourceBreakdown: SourceBreakdown[];
  hourlyData: HourlyData[];
  trendData: TrendData[];
} {
  const locationReservations = reservations.filter((r) => r.locationId === locationId);
  const locationTables = tables.filter((t) => t.locationId === locationId);
  const locationWaitlist = waitlist.filter((w) => w.locationId === locationId && w.status === 'waiting');

  const todayRes = getTodayReservations(reservations, locationId);
  const weekRes = getWeekReservations(reservations, locationId);

  const seatedTables = locationTables.filter((t) => t.status === 'occupied');

  return {
    todayMetrics: {
      totalReservations: todayRes.length,
      totalCovers: calculateTotalCovers(todayRes),
      averagePartySize: calculateAveragePartySize(todayRes),
      currentlySeated: seatedTables.reduce((sum, t) => {
        // Approximate covers based on table capacity
        return sum + Math.ceil(t.capacity * 0.8);
      }, 0),
      tableUtilization: calculateTableUtilization(locationTables),
      waitlistDepth: locationWaitlist.length,
      averageWaitTime: calculateAverageWaitTime(locationWaitlist),
    },
    weekMetrics: {
      totalReservations: weekRes.length,
      totalCovers: calculateTotalCovers(weekRes),
      noShowRate: calculateNoShowRate(weekRes),
      averagePartySize: calculateAveragePartySize(weekRes),
    },
    sourceBreakdown: calculateSourceBreakdown(weekRes),
    hourlyData: calculateHourlyData(weekRes),
    trendData: calculateTrendData(locationReservations, 7),
  };
}

/**
 * Format hour for display (e.g., "5:00 PM")
 */
export function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${period}`;
}

/**
 * Get change percentage between two values
 */
export function calculateChange(current: number, previous: number): {
  value: number;
  isPositive: boolean;
  display: string;
} {
  if (previous === 0) {
    return { value: 0, isPositive: true, display: '+0%' };
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;

  return {
    value: rounded,
    isPositive: rounded >= 0,
    display: `${rounded >= 0 ? '+' : ''}${rounded}%`,
  };
}

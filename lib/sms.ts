// Mock SMS utilities for development
// In production, this would integrate with Twilio, MessageBird, etc.

import type { SMSTemplate, NotificationLog, WaitlistEntry, Reservation, LocationId } from '@/types';

interface TemplateVariables {
  guestName?: string;
  partySize?: number;
  time?: string;
  date?: string;
  waitTime?: number;
  position?: number;
  restaurantName?: string;
}

/**
 * Renders an SMS template with the provided variables
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  let rendered = template;

  // Replace all template variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value ?? ''));
  });

  return rendered;
}

/**
 * Prepares template variables from a waitlist entry
 */
export function getWaitlistVariables(entry: WaitlistEntry): TemplateVariables {
  return {
    guestName: entry.guestName,
    partySize: entry.partySize,
    waitTime: entry.quotedWaitTime,
  };
}

/**
 * Prepares template variables from a reservation
 */
export function getReservationVariables(reservation: Reservation): TemplateVariables {
  const dateTime = new Date(reservation.dateTime);
  return {
    guestName: reservation.guestName,
    partySize: reservation.partySize,
    time: dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    date: dateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  };
}

/**
 * Mock SMS sending function
 * Returns a promise that simulates network delay
 */
export async function sendSMS(
  phone: string,
  message: string
): Promise<{ success: boolean; messageId: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

  // Log to console for development
  console.log('=== SMS SENT ===');
  console.log('To:', phone);
  console.log('Message:', message);
  console.log('================');

  // Simulate occasional failures (5% chance)
  if (Math.random() < 0.05) {
    return { success: false, messageId: '' };
  }

  return {
    success: true,
    messageId: crypto.randomUUID(),
  };
}

/**
 * Creates a notification log entry
 */
export function createNotificationLog(
  locationId: LocationId,
  type: SMSTemplate['type'],
  phone: string,
  message: string,
  status: 'sent' | 'failed',
  relatedId?: string
): NotificationLog {
  return {
    id: crypto.randomUUID(),
    locationId,
    type,
    phone,
    message,
    sentAt: new Date(),
    status: status === 'sent' ? 'delivered' : 'failed',
    relatedId,
  };
}

/**
 * Formats phone number for display
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX if it's a US number
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

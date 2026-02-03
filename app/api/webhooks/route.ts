import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  validateBody,
  withErrorHandling,
  handleCors,
  withRateLimit,
} from '@/lib/api/middleware';
import { webhookPayloadSchema } from '@/lib/api/validation';

// Supported webhook events
const SUPPORTED_EVENTS = [
  'reservation.created',
  'reservation.updated',
  'reservation.cancelled',
  'reservation.seated',
  'reservation.completed',
  'waitlist.added',
  'waitlist.notified',
  'waitlist.seated',
  'table.status_changed',
] as const;

// POST /api/webhooks - Receive incoming webhooks
export const POST = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    // Verify webhook signature in production
    const signature = request.headers.get('x-webhook-signature');
    // In production, verify signature against secret

    const validation = await validateBody(request, webhookPayloadSchema);
    if (validation.error) return validation.error;

    const { event, data, timestamp } = validation.data;

    // Validate event type
    if (!SUPPORTED_EVENTS.includes(event as typeof SUPPORTED_EVENTS[number])) {
      return errorResponse(`Unsupported event type: ${event}`, 400);
    }

    // Log webhook (in production, would process/queue the event)
    console.log('Received webhook:', { event, timestamp, data });

    // Process webhook based on event type
    switch (event) {
      case 'reservation.created':
        // Handle new reservation from external source
        break;
      case 'reservation.updated':
        // Handle reservation update
        break;
      case 'reservation.cancelled':
        // Handle cancellation
        break;
      case 'reservation.seated':
        // Handle seating notification
        break;
      case 'reservation.completed':
        // Handle completion
        break;
      case 'waitlist.added':
        // Handle waitlist addition
        break;
      case 'waitlist.notified':
        // Handle guest notification
        break;
      case 'waitlist.seated':
        // Handle waitlist seating
        break;
      case 'table.status_changed':
        // Handle table status change
        break;
      default:
        // Unknown event - should not reach here due to validation
        break;
    }

    return successResponse({
      received: true,
      event,
      timestamp: timestamp || new Date().toISOString(),
    });
  }),
  30, // Max 30 requests per minute for webhooks
  60000
);

// OPTIONS for CORS
export function OPTIONS() {
  return handleCors();
}

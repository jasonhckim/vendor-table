import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
}

// Create a success response
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

// Create an error response
export function errorResponse(
  message: string,
  status = 400,
  errors?: { field: string; message: string }[]
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: message, errors },
    { status }
  );
}

// Handle Zod validation errors
export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const errors = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return errorResponse('Validation failed', 400, errors);
}

// Validate request body against schema
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse<ApiResponse> }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, error: handleZodError(error) };
    }
    if (error instanceof SyntaxError) {
      return { data: null, error: errorResponse('Invalid JSON body', 400) };
    }
    return { data: null, error: errorResponse('Invalid request body', 400) };
  }
}

// Validate query params against schema
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse<ApiResponse> } {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return { data: null, error: handleZodError(error) };
    }
    return { data: null, error: errorResponse('Invalid query parameters', 400) };
  }
}

// Rate limiting store (simple in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Simple rate limiter
export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

// Get client IP for rate limiting
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// Middleware wrapper for rate limiting
export function withRateLimit(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
  maxRequests = 100,
  windowMs = 60000
) {
  return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
    const ip = getClientIp(request);

    if (!checkRateLimit(ip, maxRequests, windowMs)) {
      return errorResponse('Too many requests', 429);
    }

    return handler(request, context);
  };
}

// Wrapper for API handlers with error handling
export function withErrorHandling<T = unknown>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ZodError) {
        return handleZodError(error);
      }

      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error',
        500
      );
    }
  };
}

// CORS headers helper
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle OPTIONS requests for CORS
export function handleCors(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

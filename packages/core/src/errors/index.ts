/**
 * packages/core/src/errors/index.ts
 *
 * Typed error hierarchy used throughout all layers.
 * Every thrown error must be an instance of one of these classes.
 * HTTP status translation occurs only in the Hono route handler layer.
 *
 * Rules:
 * - Services throw domain errors (NotFoundError, ForbiddenError, etc.)
 * - Repository errors bubble as RepositoryError
 * - Handler layer maps errors to HTTP responses
 * - Never import HTTP libraries in this file
 */

// ---------------------------------------------------------------------------
// Base error
// ---------------------------------------------------------------------------

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    // Maintain proper prototype chain in transpiled output
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

// ---------------------------------------------------------------------------
// Validation errors (400)
// ---------------------------------------------------------------------------

export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly httpStatus = 400;

  constructor(
    message: string,
    public readonly details?: Record<string, string[]>,
    cause?: unknown
  ) {
    super(message, cause);
  }

  override toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

// ---------------------------------------------------------------------------
// Authentication errors (401)
// ---------------------------------------------------------------------------

export class UnauthenticatedError extends AppError {
  readonly code = "UNAUTHENTICATED";
  readonly httpStatus = 401;

  constructor(message = "Authentication required", cause?: unknown) {
    super(message, cause);
  }
}

// ---------------------------------------------------------------------------
// Authorization errors (403)
// ---------------------------------------------------------------------------

export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";
  readonly httpStatus = 403;

  constructor(
    message = "You do not have permission to perform this action",
    cause?: unknown
  ) {
    super(message, cause);
  }
}

// ---------------------------------------------------------------------------
// Not found errors (404)
// ---------------------------------------------------------------------------

export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;

  constructor(
    public readonly resource: string,
    public readonly identifier?: string,
    cause?: unknown
  ) {
    super(
      identifier
        ? `${resource} '${identifier}' not found`
        : `${resource} not found`,
      cause
    );
  }
}

// ---------------------------------------------------------------------------
// Conflict errors (409)
// ---------------------------------------------------------------------------

export class ConflictError extends AppError {
  readonly code = "CONFLICT";
  readonly httpStatus = 409;

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

// ---------------------------------------------------------------------------
// Rate limit errors (429)
// ---------------------------------------------------------------------------

export class RateLimitError extends AppError {
  readonly code = "RATE_LIMIT_EXCEEDED";
  readonly httpStatus = 429;

  constructor(
    message = "Too many requests. Please try again later.",
    public readonly retryAfterSeconds?: number,
    cause?: unknown
  ) {
    super(message, cause);
  }
}

// ---------------------------------------------------------------------------
// Business rule violations (422)
// ---------------------------------------------------------------------------

export class UnprocessableError extends AppError {
  readonly code = "UNPROCESSABLE";
  readonly httpStatus = 422;

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

// ---------------------------------------------------------------------------
// Repository / database errors (500)
// ---------------------------------------------------------------------------

export class RepositoryError extends AppError {
  readonly code = "REPOSITORY_ERROR";
  readonly httpStatus = 500;

  constructor(
    message: string,
    public readonly operation?: string,
    cause?: unknown
  ) {
    super(message, cause);
  }
}

// ---------------------------------------------------------------------------
// External provider errors (502)
// ---------------------------------------------------------------------------

export class ProviderError extends AppError {
  readonly code = "PROVIDER_ERROR";
  readonly httpStatus = 502;

  constructor(
    public readonly provider: string,
    message: string,
    cause?: unknown
  ) {
    super(`[${provider}] ${message}`, cause);
  }
}

// ---------------------------------------------------------------------------
// Configuration errors (500) — thrown at startup, not at request time
// ---------------------------------------------------------------------------

export class ConfigurationError extends AppError {
  readonly code = "CONFIGURATION_ERROR";
  readonly httpStatus = 500;

  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function assertNever(value: never): never {
  throw new Error(
    `Unhandled discriminated union case: ${JSON.stringify(value)}`
  );
}

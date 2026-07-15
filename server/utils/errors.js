/**
 * Custom error classes for standardized API error handling.
 *
 * All error classes carry a `status` (HTTP status code) and `code` (machine-readable
 * error identifier) so the global error handler can produce a consistent response
 * shape: { error: { code, message, details?, traceId? } }.
 */

// ---------------------------------------------------------------------------
// Error code constants — single source of truth
// ---------------------------------------------------------------------------
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  DEPENDENCY_ERROR: 'DEPENDENCY_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

// ---------------------------------------------------------------------------
// Base class
// ---------------------------------------------------------------------------

/**
 * Base API error class.
 *
 * @example
 *   throw new ApiError('User not found', { status: 404, code: 'NOT_FOUND' });
 */
export class ApiError extends Error {
  /**
   * @param {string} message  Human-readable error description.
   * @param {object} [options]
   * @param {string} [options.code='INTERNAL_ERROR']  Machine-readable error code.
   * @param {number} [options.status=500]              HTTP status code.
   * @param {*}      [options.details]                 Additional payload (validation errors, etc.).
   */
  constructor(message, { code = ErrorCodes.INTERNAL_ERROR, status = 500, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// Named subclasses — convenience constructors with sensible defaults
// ---------------------------------------------------------------------------

/** 400 — Request body/params failed validation. */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details) {
    super(message, { code: ErrorCodes.VALIDATION_ERROR, status: 400, details });
  }
}

/** 401 — Authentication missing or invalid. */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, { code: ErrorCodes.UNAUTHORIZED, status: 401 });
  }
}

/** 403 — Authenticated but insufficient permissions. */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, { code: ErrorCodes.FORBIDDEN, status: 403 });
  }
}

/** 404 — Resource does not exist. */
export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(message, { code: ErrorCodes.NOT_FOUND, status: 404 });
  }
}

/** 409 — Conflict with current state (duplicate, stale version, etc.). */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, { code: ErrorCodes.CONFLICT, status: 409 });
  }
}

/** 429 — Rate-limited. */
export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests') {
    super(message, { code: ErrorCodes.RATE_LIMITED, status: 429 });
  }
}

/** 502 — External dependency failure. */
export class DependencyError extends ApiError {
  constructor(message = 'Dependency error') {
    super(message, { code: ErrorCodes.DEPENDENCY_ERROR, status: 502 });
  }
}

// ---------------------------------------------------------------------------
// Backward-compatible aliases (legacy code imported AppError)
// ---------------------------------------------------------------------------
/** @deprecated Use `ApiError` instead. */
export const AppError = ApiError;

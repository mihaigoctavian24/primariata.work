/**
 * Standard API Response Types
 * Used across all API endpoints for consistent response format
 */

/**
 * Generic API success response wrapper
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp?: string;
    version?: string;
  };
}

/**
 * API error response wrapper
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp?: string;
    request_id?: string;
  };
}

/**
 * Județ type for API responses
 * Matches the database schema but optimized for API consumption
 */
export interface Judet {
  id: number;
  cod: string;
  nume: string;
  nume_complet: string | null;
}

/**
 * Helper type for pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: PaginationMeta;
  };
}

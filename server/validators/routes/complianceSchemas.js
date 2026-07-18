import { z } from 'zod';

const DOCUMENT_TYPES = ['privacy_policy', 'terms_of_service', 'code_of_conduct', 'event_waiver'];

const GDPR_REQUEST_TYPES = ['data_deletion', 'data_export', 'consent_withdrawal'];

/**
 * Schema for POST /acceptances — Record user acceptance of a document.
 */
export const recordAcceptanceSchema = z
  .object({
    userId: z.string().trim().min(1, 'userId is required'),
    documentId: z.string().trim().min(1, 'documentId is required'),
    ipAddress: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema for POST /gdpr — Submit a GDPR request.
 */
export const gdprRequestSchema = z
  .object({
    userId: z.string().trim().min(1, 'userId is required'),
    type: z.enum(GDPR_REQUEST_TYPES, {
      errorMap: () => ({
        message: 'type must be data_deletion, data_export, or consent_withdrawal',
      }),
    }),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

/**
 * Schema for POST /admin/documents — Create a new compliance document.
 */
export const createDocumentSchema = z
  .object({
    type: z.enum(DOCUMENT_TYPES, {
      errorMap: () => ({ message: 'Invalid document type' }),
    }),
    title: z.string().trim().min(1, 'title is required'),
    version: z.string().trim().optional(),
    effectiveDate: z.string().trim().optional(),
    content: z.string().trim().min(1, 'content is required'),
    summary: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema for PATCH /admin/documents/:id — Update an existing document.
 * Only the allowed fields from the service are accepted.
 */
export const updateDocumentSchema = z
  .object({
    title: z.string().trim().optional(),
    content: z.string().trim().optional(),
    summary: z.string().trim().optional(),
    effectiveDate: z.string().trim().optional(),
  })
  .strict();

/**
 * Schema for PATCH /admin/gdpr/:id — Process a GDPR request.
 */
export const processGdprRequestSchema = z
  .object({
    status: z.enum(['completed', 'rejected'], {
      errorMap: () => ({ message: 'status must be completed or rejected' }),
    }),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

// Code-first placeholder implementation for #1787.
// DB persistence + Prisma models are TODO.

import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

// --- Helpers ---
function buildCertificateCode({ userId, eventId }) {
  // NOTE: final PR should use DB uniqueness constraints.
  return crypto
    .createHash('sha256')
    .update(`${userId}:${eventId}:${Date.now()}`)
    .digest('hex')
    .slice(0, 16)
    .toUpperCase();
}

// --- Controllers ---
export async function verifyCertificate(req, res) {
  const { code } = req.params;

  // TODO: lookup certificate by code.
  // Placeholder response shape per acceptance criteria.
  return sendSuccess(res, {
    certificate: {
      code,
      attendeeName: 'Demo Attendee',
      eventName: 'Demo Workshop',
      date: new Date().toISOString().slice(0, 10),
      completionCriteria: 'Completed workshop requirements',
      status: 'PENDING',
      verified: false,
      verifiedAt: null,
      expiresAt: null,
    },
  });
}

export async function getMyCertificates(req, res) {
  // TODO: use req.studentUser / DB
  return sendSuccess(res, {
    certificates: [],
  });
}

export async function downloadCertificatePdf(req, res) {
  // TODO: stream from S3
  return sendError(req, res, 'PDF download not implemented yet (S3 + storage layer TODO).', 501, 'NOT_IMPLEMENTED');
}

export async function getOpenBadge(req, res) {
  // TODO: return OpenBadges compliant JSON from stored badge assertion.
  const { id } = req.params;
  return sendSuccess(res, {
    id,
    openBadges: {
      '@context': 'https://w3.org/2018/credentials/v1',
      type: 'OpenBadgeCredential',
      badge: { name: 'Demo Badge' },
      // assertion evidence TODO
    },
  });
}

export async function getCertificateVerificationShare(req, res) {
  // TODO: generate proper share URLs containing certificate verify route.
  const { id } = req.params;
  const verifyUrl = `${process.env.PUBLIC_APP_URL || ''}/certificates/verify/${id}`;

  return sendSuccess(res, {
    id,
    linkedin: {
      shareUrl: verifyUrl,
    },
    twitter: {
      text: 'I earned a digital badge!',
      shareUrl: verifyUrl,
    },
    embeddableHtml: `<div data-badge-id=\"${id}\"></div>`,
  });
}

// Admin issuance trigger (placeholder)
export async function issueCertificates(req, res) {
  // Expected input: { eventId, attendeeIds: [...] , expirationDays? }
  const body = req.body || {};
  const eventId = body.eventId;
  const attendeeIds = Array.isArray(body.attendeeIds) ? body.attendeeIds : [];

  if (!eventId || attendeeIds.length === 0) {
    return sendError(req, res, 'eventId and attendeeIds[] are required', 400, 'VALIDATION_ERROR');
  }

  // TODO: generate PDF/QR/badge and persist
  const issued = attendeeIds.map((userId) => {
    const code = buildCertificateCode({ userId, eventId });
    return {
      userId,
      eventId,
      code,
      status: 'ISSUED',
    };
  });

  return sendSuccess(res, { issued });
}

// Code-first placeholder implementation for #1787.
// DB persistence + Prisma models are TODO.

import crypto from 'crypto';
import { renderCertificatePdf } from '../services/certificates/certificatePdfGenerator.js';

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
  return res.json({
    ok: true,
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
  return res.json({
    certificates: [],
  });
}

export async function downloadCertificatePdf(req, res) {
  try {
    const { id } = req.params;
    // Mock data based on id
    const variables = {
      code: id || 'DEMO-1234',
      attendeeName: 'Demo Attendee',
      eventName: 'NexaSphere Event',
      date: new Date().toISOString().slice(0, 10),
      verifyUrl: `${process.env.PUBLIC_APP_URL || 'http://localhost:3000'}/certificates/verify/${id || 'DEMO-1234'}`,
    };

    const pdfBuffer = await renderCertificatePdf({ variables });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${id || 'demo'}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate certificate PDF' });
  }
}

export async function getOpenBadge(req, res) {
  // TODO: return OpenBadges compliant JSON from stored badge assertion.
  const { id } = req.params;
  return res.json({
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

  return res.json({
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
    return res.status(400).json({ error: 'eventId and attendeeIds[] are required' });
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

  return res.json({ ok: true, issued });
}

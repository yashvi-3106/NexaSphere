// Admin controllers for #1787

import { sendSuccess, sendError } from '../utils/responseHelper.js';

export async function adminGetCertificateById(req, res) {
  const { id } = req.params;
  return sendSuccess(res, {
    id,
    certificate: {
      id,
      verified: false,
      revoked: false,
    },
  });
}

export async function adminVerifyCertificate(req, res) {
  const { id } = req.params;
  // TODO: update DB verification status + audit log.
  return sendSuccess(res, { id, verified: true });
}

export async function adminRevokeCertificate(req, res) {
  const { id } = req.params;
  // TODO: update DB verification status + audit log.
  return sendSuccess(res, { id, revoked: true });
}

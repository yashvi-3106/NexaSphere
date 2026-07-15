import { sendSuccess, sendError } from '../utils/responseHelper.js';
import { formsService } from '../services/formsService.js';

const ALLOWED_FORM_TYPES = new Set(['membership', 'recruitment', 'core_team']);

function wrapAsync(fn) {
  return (req, res) =>
    Promise.resolve(fn(req, res)).catch((e) => {
      if (e && e.message === 'Invalid form submission' && e.details) {
        return sendError(req, res, e.message, 400, 'VALIDATION_ERROR', e.details);
      }

      console.error('[wrapAsync error]', e);

      return sendError(req, res, 'Internal server error', 500, 'INTERNAL_ERROR');
    });
}

export function makeHandleForm(formType) {
  return wrapAsync(async (req, res) => {
    const result = await formsService.handleForm(formType, req.body || {});
    return sendSuccess(res, result);
  });
}

export const handleFormByParam = wrapAsync(async (req, res) => {
  const formType = req.params?.formType;

  if (!ALLOWED_FORM_TYPES.has(formType)) {
    return sendError(req, res, 'Invalid form type', 400, 'VALIDATION_ERROR');
  }

  const result = await formsService.handleForm(formType, req.body || {});
  return sendSuccess(res, result);
});

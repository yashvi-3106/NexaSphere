import { Router } from 'express';
import { portfolioBuilderService } from '../services/portfolioBuilderService.js';
import { auth } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { validate } from '../middleware/validate.js';
import {
  usernameParamsSchema,
  sectionParamsSchema,
  sectionWithDirectionParamsSchema,
  templateParamsSchema,
  addSectionBodySchema,
  updateSectionBodySchema,
  reorderSectionsBodySchema,
  sectionContentBodySchema,
} from '../validators/routes/portfolioBuilderSchemas.js';

const router = Router();

router.get('/:username/sections', validate(usernameParamsSchema, 'params'), async (req, res) => {
  try {
    const sections = await portfolioBuilderService.getSections(req.params.username);
    res.json({ success: true, data: sections });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.post('/:username/sections', validate(usernameParamsSchema, 'params'), validate(addSectionBodySchema), auth('student'), async (req, res) => {
  try {
    const section = await portfolioBuilderService.addSection(req.params.username, req.body);
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    const status = error.message.includes('not found')
      ? 404
      : error.message.includes('already exists')
        ? 409
        : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.put('/:username/sections/:sectionKey', validate(sectionParamsSchema, 'params'), validate(updateSectionBodySchema), auth('student'), async (req, res) => {
  try {
    const section = await portfolioBuilderService.updateSection(
      req.params.username,
      req.params.sectionKey,
      req.body
    );
    res.json({ success: true, data: section });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.delete('/:username/sections/:sectionKey', validate(sectionParamsSchema, 'params'), auth('student'), async (req, res) => {
  try {
    await portfolioBuilderService.deleteSection(req.params.username, req.params.sectionKey);
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.put('/:username/sections/reorder', validate(usernameParamsSchema, 'params'), validate(reorderSectionsBodySchema), auth('student'), async (req, res) => {
  try {
    const sections = await portfolioBuilderService.reorderSections(
      req.params.username,
      req.body.sections
    );
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:username/sections/:sectionKey/visibility', validate(sectionParamsSchema, 'params'), auth('student'), async (req, res) => {
  try {
    const section = await portfolioBuilderService.toggleSectionVisibility(
      req.params.username,
      req.params.sectionKey
    );
    res.json({ success: true, data: section });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.put('/:username/sections/:sectionKey/move/:direction', validate(sectionWithDirectionParamsSchema, 'params'), auth('student'), async (req, res) => {
  try {
    const { direction } = req.params;
    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Direction must be up or down' });
    }
    const sections = await portfolioBuilderService.moveSection(
      req.params.username,
      req.params.sectionKey,
      direction
    );
    res.json({ success: true, data: sections });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.put('/:username/sections/:sectionKey/content', validate(sectionParamsSchema, 'params'), validate(sectionContentBodySchema), auth('student'), async (req, res) => {
  try {
    const section = await portfolioBuilderService.updateSectionContent(
      req.params.username,
      req.params.sectionKey,
      req.body
    );
    res.json({ success: true, data: section });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const templates = await portfolioBuilderService.getTemplates();
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:username/sections/template/:templateId', validate(templateParamsSchema, 'params'), auth('student'), async (req, res) => {
  try {
    const section = await portfolioBuilderService.addSectionFromTemplate(
      req.params.username,
      req.params.templateId,
      req.body
    );
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
});

export default router;

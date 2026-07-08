import { emailTemplateRepository } from '../repositories/emailTemplateRepository.js';
import { sendEmail, renderTemplateHtml } from '../services/emailService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getMockDataForTemplate(templateName) {
  // Common placeholders for previewing
  return {
    username: 'Jane Doe',
    name: 'Jane Doe',
    eventname: 'Annual Tech Symposium',
    title: 'Annual Tech Symposium',
    date: new Date().toLocaleDateString(),
    verifyUrl: 'https://nexasphere.example.com/verify?token=mock',
    resetUrl: 'https://nexasphere.example.com/reset?token=mock',
    dashboardUrl: 'https://nexasphere.example.com/dashboard',
  };
}

export const emailTemplateController = {
  async getTemplates(req, res) {
    try {
      const templates = await emailTemplateRepository.getAll();
      return res.json({ templates });
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getTemplate(req, res) {
    try {
      const { name } = req.params;
      const template = await emailTemplateRepository.getByName(name);
      if (!template) {
        // Return default if not in DB
        try {
          const templatePath = path.join(__dirname, '..', 'services', 'templates', `${name}.ejs`);
          const body = await fs.readFile(templatePath, 'utf-8');
          return res.json({ template: { name, subject: 'Default Subject', body, is_default: true } });
        } catch (err) {
          return res.status(404).json({ error: 'Template not found' });
        }
      }
      return res.json({ template });
    } catch (error) {
      console.error('Error fetching template:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateTemplate(req, res) {
    try {
      const { name } = req.params;
      const { subject, body } = req.body;

      if (!subject || !body) {
        return res.status(400).json({ error: 'Subject and body are required' });
      }

      const updated = await emailTemplateRepository.upsertTemplate({ name, subject, body });
      return res.json({ template: updated });
    } catch (error) {
      console.error('Error updating template:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async resetTemplate(req, res) {
    try {
      const { name } = req.params;
      await emailTemplateRepository.deleteTemplate(name);
      return res.json({ success: true, message: 'Template reset to default' });
    } catch (error) {
      console.error('Error resetting template:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async previewTemplate(req, res) {
    try {
      const { name } = req.params;
      const { body } = req.body;
      const mockData = getMockDataForTemplate(name);

      let html = '';
      if (body) {
        html = await renderTemplateHtml(name, mockData, body);
      } else {
        html = await renderTemplateHtml(name, mockData);
      }

      return res.json({ html });
    } catch (error) {
      console.error('Error previewing template:', error);
      return res.status(500).json({ error: error.message || 'Error rendering template' });
    }
  },

  async testTemplate(req, res) {
    try {
      const { name } = req.params;
      const { email, subject, body } = req.body;

      if (!email) return res.status(400).json({ error: 'Email is required' });

      const mockData = getMockDataForTemplate(name);

      const result = await sendEmail({
        to: email,
        subject: subject || `Test: ${name} Template`,
        templateName: name,
        data: mockData,
        customTemplateContent: body || null,
      });

      if (!result.success) {
        return res.status(500).json({ error: 'Failed to send test email' });
      }

      return res.json({ success: true, messageId: result.messageId });
    } catch (error) {
      console.error('Error sending test email:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

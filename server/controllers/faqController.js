import { faqRepository } from '../repositories/faqRepository.js';

export const faqController = {
  // Public endpoint
  async getFAQs(req, res) {
    try {
      const search = req.query.search || '';
      const category = req.query.category || null;
      const faqs = await faqRepository.getAll(search, category);
      return res.json({ faqs });
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Track views
  async trackView(req, res) {
    try {
      const { id } = req.params;
      await faqRepository.incrementViews(id);
      return res.json({ success: true });
    } catch (err) {
      console.error('Error tracking FAQ view:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin endpoint: list all
  async adminGetFAQs(req, res) {
    try {
      const faqs = await faqRepository.getAdminAll();
      return res.json({ faqs });
    } catch (err) {
      console.error('Error fetching Admin FAQs:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin endpoint: create
  async adminCreateFAQ(req, res) {
    try {
      const { question, answer, category, is_active } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }
      const faq = await faqRepository.create({ question, answer, category, is_active });
      return res.status(201).json({ faq });
    } catch (err) {
      console.error('Error creating FAQ:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin endpoint: update
  async adminUpdateFAQ(req, res) {
    try {
      const { id } = req.params;
      const { question, answer, category, is_active } = req.body;
      const updated = await faqRepository.update(id, { question, answer, category, is_active });
      if (!updated) return res.status(404).json({ error: 'FAQ not found' });
      return res.json({ faq: updated });
    } catch (err) {
      console.error('Error updating FAQ:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Admin endpoint: delete
  async adminDeleteFAQ(req, res) {
    try {
      const { id } = req.params;
      const deleted = await faqRepository.delete(id);
      if (!deleted) return res.status(404).json({ error: 'FAQ not found' });
      return res.json({ success: true });
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

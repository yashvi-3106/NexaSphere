import prisma from '../config/db.js'; // Adjust path to your Prisma client

// 1. Fetch templates (supports search, system vs user filtering)
export const getTemplates = async (req, res) => {
  try {
    const { search, type } = req.query;
    const where = {};

    if (type === 'system') where.isSystem = true;
    if (type === 'user') where.isSystem = false;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.eventTemplate.findMany({ where });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// 2. Save an existing event/new configuration as a reusable template
export const createTemplate = async (req, res) => {
  try {
    const template = await prisma.eventTemplate.create({
      data: { ...req.body, createdBy: req.user.id },
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
};

// 3. Clone template & track analytics usage counter
export const cloneTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.eventTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    // Explicitly omit live operational data like dates/times for clean copying
    const { id: _, createdAt: __, updatedAt: ___, usageCount: ____, ...clonedData } = template;
    res.json(clonedData);
  } catch (error) {
    res.status(500).json({ error: 'Cloning processing failure' });
  }
};

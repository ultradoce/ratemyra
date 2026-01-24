import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getPrismaClient } from '../utils/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = getPrismaClient();

// Rate limiting: 5 help messages per hour per IP
const helpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many help requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/help
 * Submit a help message
 */
router.post(
  '/',
  helpRateLimit,
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required (max 100 characters)'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required (max 200 characters)'),
    body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
  ],
  async (req, res, next) => {
    try {
      if (!prisma) {
        return res.status(503).json({ error: 'Database not available' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, subject, message } = req.body;
      const userId = req.user?.id || null; // Optional: link to user if logged in

      const helpMessage = await prisma.helpMessage.create({
        data: {
          name,
          email,
          subject,
          message,
          userId,
          status: 'UNREAD',
        },
      });

      res.status(201).json({
        message: 'Help request submitted successfully. We will get back to you soon!',
        id: helpMessage.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/help
 * Get help messages (admin only)
 */
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { status, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const [messages, total] = await Promise.all([
      prisma.helpMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      prisma.helpMessage.count({ where }),
    ]);

    res.json({
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/help/stats
 * Get help message statistics (admin only)
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const [total, unread, read, inProgress, resolved, archived] = await Promise.all([
      prisma.helpMessage.count(),
      prisma.helpMessage.count({ where: { status: 'UNREAD' } }),
      prisma.helpMessage.count({ where: { status: 'READ' } }),
      prisma.helpMessage.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.helpMessage.count({ where: { status: 'RESOLVED' } }),
      prisma.helpMessage.count({ where: { status: 'ARCHIVED' } }),
    ]);

    res.json({
      total,
      unread,
      read,
      inProgress,
      resolved,
      archived,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/help/:id
 * Update help message status or add admin notes (admin only)
 */
router.patch(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    body('status').optional().isIn(['UNREAD', 'READ', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED']),
    body('adminNotes').optional().isString().isLength({ max: 5000 }),
  ],
  async (req, res, next) => {
    try {
      if (!prisma) {
        return res.status(503).json({ error: 'Database not available' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const updateData = {};
      if (status) {
        updateData.status = status;
        if (status === 'RESOLVED' || status === 'ARCHIVED') {
          updateData.respondedAt = new Date();
        }
      }
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }

      const helpMessage = await prisma.helpMessage.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.json({ message: 'Help message updated successfully', helpMessage });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Help message not found' });
      }
      next(error);
    }
  }
);

/**
 * DELETE /api/help/:id
 * Delete a help message (admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    if (!prisma) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;

    await prisma.helpMessage.delete({
      where: { id },
    });

    res.json({ message: 'Help message deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Help message not found' });
    }
    next(error);
  }
});

export default router;

const express = require('express');
const router = express.Router();
const {
  getAllArenas,
  getArenaById,
  getAvailableSlots,
  createArena,
  updateArena,
  deleteArena
} = require('../controllers/arenaController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllArenas);
router.get('/:id', getArenaById);
router.get('/:id/slots/:date', getAvailableSlots);

// Admin only
router.post('/', protect, authorize('admin'), createArena);
router.put('/:id', protect, authorize('admin'), updateArena);
router.delete('/:id', protect, authorize('admin'), deleteArena);

module.exports = router;

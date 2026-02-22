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
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllArenas);
router.get('/:id', getArenaById);
router.get('/:id/slots/:date', getAvailableSlots);

// Admin only
router.post('/', protect, createArena);
router.put('/:id', protect, updateArena);
router.delete('/:id', protect, deleteArena);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getOwnerSummary,
  getOwnerArenas,
  createOwnerArena,
  updateOwnerArena,
  deleteOwnerArena,
  updateArenaSlots,
  getOwnerBookings,
  updateOwnerBookingStatus,
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('owner', 'admin'));

router.get('/summary', getOwnerSummary);
router.get('/arenas', getOwnerArenas);
router.post('/arenas', createOwnerArena);
router.put('/arenas/:id', updateOwnerArena);
router.delete('/arenas/:id', deleteOwnerArena);
router.put('/arenas/:id/slots', updateArenaSlots);
router.get('/bookings', getOwnerBookings);
router.put('/bookings/:id/status', updateOwnerBookingStatus);

module.exports = router;

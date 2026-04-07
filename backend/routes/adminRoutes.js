const express = require('express');
const router = express.Router();
const {
  getAdminSummary,
  getAllUsers,
  updateUserStatus,
  getAllArenas,
  updateArenaStatus,
  deleteArena,
  getAllBookings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));

router.get('/summary', getAdminSummary);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/arenas', getAllArenas);
router.put('/arenas/:id/status', updateArenaStatus);
router.delete('/arenas/:id', deleteArena);
router.get('/bookings', getAllBookings);

module.exports = router;

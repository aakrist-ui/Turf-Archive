const express = require('express');
const router = express.Router();
const {
  createTeam,
  getAllTeams,
  getTeamById,
  getMyTeam,
  addMember,
  removeMember,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllTeams);
router.get('/:id', getTeamById);

// Protected routes
router.post('/', protect, createTeam);
router.get('/my/team', protect, getMyTeam);
router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, deleteTeam);

module.exports = router;
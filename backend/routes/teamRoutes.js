const express = require('express');
const router = express.Router();
const {
  createTeam,
  getAllTeams,
  getTeamById,
  getMyTeam,
  addMember,
  removeMember,
  leaveTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllTeams);

// Protected routes
router.post('/', protect, createTeam);
router.get('/my/team', protect, getMyTeam);
router.delete('/:id/leave', protect, leaveTeam);
router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, deleteTeam);
router.get('/:id', getTeamById);

module.exports = router;

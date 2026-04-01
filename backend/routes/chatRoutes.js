const express = require('express');
const router = express.Router();
const {
  getMyChats,
  createDirectChat,
  createGroupChat,
  getOrCreateTeamChat,
  getChatMessages,
  sendMessage,
  deleteMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMyChats);
router.post('/direct', createDirectChat);
router.post('/group', createGroupChat);
router.post('/team/:teamId', getOrCreateTeamChat);
router.get('/:id/messages', getChatMessages);
router.post('/:id/messages', sendMessage);
router.delete('/:id/messages/:messageId', deleteMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const { searchUsers, getMyProfile, updateMyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', searchUsers);
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);

module.exports = router;

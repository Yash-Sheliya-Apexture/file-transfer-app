// server/src/routes/user.routes.js
const express = require('express');
const { getProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/profile', protect, getProfile);

module.exports = router;
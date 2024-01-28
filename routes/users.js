const express = require('express');
const User = require('../schemas/user');
const { verifyToken } = require('../utils/auth');
const router = express.Router();

router.get('', verifyToken, async (req, res) => {
    let regex = new RegExp(req.query.q, 'i');
    const users = await User.find({ username: { $regex: regex } }, { username: 1 }).limit(5);
    res.status(200).json({ users: users });
})

module.exports = router;

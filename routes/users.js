const express = require('express');
const User = require('../schemas/user');
const { verifyToken } = require('../utils/auth');
const router = express.Router();

router.get('', verifyToken, async (req, res) => {
    let regex = new RegExp(req.query.q, 'i');
    const users = await User.find({ username: { $regex: regex } }, { username: 1 }).limit(5);
    res.status(200).json({ users: users });
})

router.get('/image', verifyToken, async (req, res) => {
    const retUser = await User.findOne({ username: req.query.q });
    if (retUser.profileImage) {
        const imagePath = process.cwd() + '/uploads/' + retUser.profileImage;
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ msg: 'image not found' });
    }
})

router.get('/details', verifyToken, async (req, res) => {
    let regex = new RegExp(req.query.q, 'i');
    const users = await User.find({ username: { $regex: regex } }, { username: 1 }).limit(5);
    res.status(200).json({ users: users });
})

module.exports = router;

const express = require('express');
const User = require('../schemas/user');
const { generateToken, verifyToken, sendVerificationEmail } = require('../utils/auth');
const router = express.Router();


router.post('/signup', async function (req, res) {
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        res.status(201).json({ msg: 'created successfuly', userId: newUser._id });
    } catch (e) {
        res.status(400).json({ 'msg': e.message });
    }
});

router.post('/signin', async function (req, res) {
    res.clearCookie('token');
    const user = await User.findOne({
        $or: [
            { username: req.body.username, password: req.body.password },
            { email: req.body.username, password: req.body.password }
        ]
    });
    if (user) {
        const token = await generateToken(user.username);
        res.cookie('token', token);
        res.status(200).json({ msg: "sign in successful" });
    } else {
        res.status(400).json({ msg: "wrong username or password" });
    }
});

router.get('/verify', verifyToken, async function (req, res) {
    if (req.user.verified) {
        res.status(400).json({ msg: "email is already verified" });
    } else {
        const code = Math.floor(100000 + Math.random() * 900000);
        req.user.verificationCode = code;
        req.user.save();
        if (req.user) {
            sendVerificationEmail(req.user.email, code);
            res.status(200).json({ msg: "code sent to email" });
        } else {
            res.status(500).json({ msg: "couldn't send email" });
        }
    }
});

router.post('/verify', verifyToken, async function (req, res) {
    if (req.body.code === req.user.verificationCode) {
        req.user.verified = true;
        req.user.save();
        res.status(200).json({ msg: "email verified" });
    } else {
        res.status(400).json({ msg: "email verification failed" });
    }
});

module.exports = router;

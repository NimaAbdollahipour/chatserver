const express = require('express');
const User = require('../schemas/user');
const multer = require('multer');
const { generateToken, verifyToken, sendVerificationEmail } = require('../utils/auth');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        req.user.profileImage = req.user.username + '.' + file.originalname.split('.').pop()
        req.user.save()
        cb(null, req.user.profileImage)
    }
})

const upload = multer({ storage: storage })

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
        req.user.verificationCode = { code: code, expiresIn: new Date((new Date()).getTime() + 600000)};
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
    console.log(req.user.verificationCode.expiresIn, new Date());
    if (req.body.code === req.user.verificationCode.code && req.user.verificationCode.expiresIn>new Date() ) {
        req.user.verified = true;
        req.user.save();
        res.status(200).json({ msg: "email verified" });
    } else {
        res.status(400).json({ msg: "email verification failed (wrong code or expired)" });
    }
});

router.post('/profile-image', verifyToken, upload.single('photo'), async function (req, res) {
    res.status(200).json({ msg: 'sent' });
}); 

router.get('/profile-image', verifyToken, async function (req, res) {
    const imageName = req.user.profileImage;
    const imagePath = process.cwd()+'/uploads/' + imageName;
    res.sendFile(imagePath);
});

router.put('/email', verifyToken, async function (req, res) {
    req.user.email = req.body.email;
    req.user.verified = false;
    try {
        req.user.save();
        res.status(200).json({ msg: "email updated, verify the email" })
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

module.exports = router;

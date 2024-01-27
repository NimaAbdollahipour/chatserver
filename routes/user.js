const express = require('express');
const User = require('../schemas/user');
const mongoose = require('mongoose');
const multer = require('multer');
const { generateToken, verifyToken, sendVerificationEmail, sendResetEmail, generateCode, generatePassword } = require('../utils/auth');
const user = require('../schemas/user');
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
            { email: req.body.username, password: req.body.password },
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

router.post('/one-time-signin', async function (req, res) {
    res.clearCookie('token');
    const user = await User.findOne({
        $or: [
            { username: req.body.username},
            { email: req.body.username},
        ]
    });
    if (user.oneTimePassword.password && user.oneTimePassword.password === req.body.password && user.oneTimePassword.expiresIn>(new Date())) {
        const token = await generateToken(user.username);
        res.cookie('token', token);
        user.oneTimePassword.password = null;
        user.save();
        res.status(200).json({ msg: "sign in successful change your password" });
    } else {
        user.oneTimePassword.password = null;
        user.save();
        res.status(400).json({ msg: "wrong username or password (try asking for a new one time password" });
    }
});

router.get('/verify', verifyToken, async function (req, res) {
    if (req.user.verified) {
        res.status(400).json({ msg: "email is already verified" });
    } else {
        const code = await generateCode();
        req.user.verificationCode = { code: code, expiresIn: new Date((new Date()).getTime() + 600000)};
        await req.user.save();
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
        await req.user.save();
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
        await req.user.save();
        res.status(200).json({ msg: "email updated, verify the email" })
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

router.put('/password', verifyToken, async function (req, res) {
    try {
        req.user.password = req.body.password;
        await req.user.save();
        if (req.user.password === req.body.password) {
            res.status(200).json({ msg: 'password updated' });
        } else {
            res.status(400).json({ msg: "password didn't meet requirements" });
        }
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
})

router.get('/reset-password', async function (req, res) {
    const user = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.username }] });
    if (user.verified) {
        const password = await generatePassword();
        sendResetEmail(user.email, password);
        user.oneTimePassword = { password: password, expiresIn: new Date((new Date()).getTime() + 600000) };
        user.save();
        res.status(200).json({ msg: "one time password sent to email" });
    } else {
        res.status(402).json({ msg: "email is not verified" });
    }
})

router.get('/details', verifyToken, async function (req, res) {
    const user = req.user;
    res.json({
        details: {
            username: user.username,
            email: user.password,
            verified: user.verified
        }
    });
})

router.get('/prefrences', verifyToken, async function (req, res) {
    const user = req.user;
    res.json({
        prefrences: {
            blocked: user.blocked,
            prefrences: user.prefrences,
            hiddenChats: user.hiddenChats,
            hiddenGroups: user.hiddenGroups
        }
    });
})

router.put('/block', verifyToken, async function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.body.id)) {
        if (await User.findOne({ _id: new mongoose.Types.ObjectId(req.body.id) })) {
            if (!req.user.blocked.includes(new mongoose.Types.ObjectId(req.body.id))) {
                req.user.blocked.unshift(new mongoose.Types.ObjectId(req.body.id));
            }
            req.user.save();
            res.status(200).json({ msg: 'user blocked' });
        } else {
            res.status(404).json({ msg: 'user not found' });
        }
    } else {
        res.status(400).json({ msg: 'send a valid id' });
    }
})

router.put('/unblock', verifyToken, async function (req, res) {
    if (mongoose.Types.ObjectId.isValid(req.body.id)) {
        if (await User.findOne({ _id: new mongoose.Types.ObjectId(req.body.id) })) {
            const index = req.user.blocked.indexOf(new mongoose.Types.ObjectId(req.body.id));
            req.user.blocked.splice(index, 1);
            req.user.save();
            res.status(200).json({ msg: 'user unblocked' });
        } else {
            res.status(404).json({ msg: 'user not found' });
        }
    } else {
        res.status(400).json({ msg: 'send a valid id' });
    }
})

router.put('/prefrences/hide', verifyToken, async function (req, res) {
    // to do
})

router.put('/prefrences/theme', verifyToken, async function (req, res) {
    // to do
})

router.put('/prefrences/permitanonymous', verifyToken, async function (req, res) {
    // to do
})

router.put('/prefrences/permitgroup', verifyToken, async function (req, res) {
    // to do
})

module.exports = router;

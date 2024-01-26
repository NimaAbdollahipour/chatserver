const bc = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
const nodemailer = require('nodemailer');

const hashPassword = async(password) => {
    const salt = await bc.genSalt(10);
    return await bc.hash(password, salt);
}

const generateToken = async (username) => {
    return await jwt.sign({ user: username }, process.env.SECRET_KEY, { expiresIn: '15m' });
}

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    try {
        jwt.verify(token, process.env.SECRET_KEY);
        const tokenData = jwt.decode(token);
        const currentUser = await User.findOne({ username: tokenData.user });
        if (currentUser) {
            req.user = currentUser;
            next();
        } else {
            res.status(402).json({
                msg: 'token is not valid or expired'
            });
        }
    } catch {
        res.status(402).json({
            msg: 'token is not valid or expired'
        });
    }
}

const sendVerificationEmail = async (email, code) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'chatgram verification code',
        text: `Your verification code is ${code}`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    hashPassword,
    generateToken,
    verifyToken,
    sendVerificationEmail
}
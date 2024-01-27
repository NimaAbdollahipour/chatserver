const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique:true,
        minlength: 4,
        maxlength: 32
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 8,
        maxlength: 256,
        validate: {
            validator: function (v) {
                return /\S@\S.\S/.test(v);
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 32,
        validate: {
            validator: function (password) {
                const hasUppercase = /[A-Z]/.test(password);
                const hasLowercase = /[a-z]/.test(password);
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                if (hasUppercase && hasLowercase && hasSpecialChar) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        code: {
            type: String,
            default: ''
        },
        expiresIn: {
            type:Date
        }
    },
    oneTimePassword: {
        password: {
            type: String,
            default: null
        },
        expiresIn: {
            type: Date
        }
    },
    blocked: [mongoose.Schema.Types.ObjectId],
    hiddenChats: [mongoose.Schema.Types.ObjectId],
    hiddenGroups: [mongoose.Schema.Types.ObjectId],
    prefrences: {
        showHidden: {
            type: Boolean,
            default: false
        },
        allowAnonymous: {
            type: Boolean,
            default: true
        },
        permitGroup: {
            type: Boolean,
            default: true
        },
        permitionList: [mongoose.Schema.Types.ObjectId],
        theme: {
            type: String,
            default:"light"
        }
    },
    profileImage: String,
});

module.exports = mongoose.model('User', userSchema); 
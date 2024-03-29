const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: mongoose.Schema.Types.ObjectId,
    chat: mongoose.Schema.Types.ObjectId,
    content: String,
    seen: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date
    },
    updatedAt: {
        type: Date,
        default: Date
    },
    attachedFile: {
        file: fileSchema,
    },
    changed: {
        type: Boolean,
        default: false
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
    }
})

messageSchema.pre('save', function (next) {
    let message = this;
    message.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Message', messageSchema);
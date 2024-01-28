const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    usersOne: mongoose.Schema.ObjectId,
    usersTwo: mongoose.Schema.ObjectId,
    lastMessage: {
        content: String,
        date: Date,
    },
    userOnePrefrences: {
        notifications: Boolean,
        hidden: Boolean
    },
    userTwoPrefrences: {
        notifications: Boolean,
        hidden: Boolean
    }
})

module.exports = mongoose.model('Chat', chatSchema);
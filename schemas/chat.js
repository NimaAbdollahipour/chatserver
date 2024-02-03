const mongoose = require('mongoose');
const { messageSchema } = require('./message')

const chatSchema = new mongoose.Schema({
    lastMessage: messageSchema,
    participants: [{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        unreadMessages:{
            type:Number,
            default:1
        },
        inChat:{
            type:Boolean,
            default:false
        }
    }]
})

module.exports = mongoose.model('Chat', chatSchema);
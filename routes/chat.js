const express = require('express');
const User = require('../schemas/user');
const { verifyToken } = require('../utils/auth');
const router = express.Router();
const Chat = require('../schemas/chat');
const { Message } = require('../schemas/message');

router.get('/', verifyToken, async (req, res) => {
    const allChats = await Chat.find({userOne:req.user.username}).sort({'lastMessage.createdAt':-1}).toArray()
    res.status(200).json({chats:allChats})
})

router.delete('/:id', verifyToken, async (req, res) => {
    const result = await Chat.delete({_id:req.params.id})
    res.status(200).json({msg:'chat deleted successfully', res:result})
})

router.put('/notification/', verifyToken, async (req, res) => {
    const chat = await Chat.findOne({_id:req.body.chatId})
    const index = chat.participants.findIndex(item=>item.user===req.user._id)
    chat.participants[index].setting = req.body.notification
    chat.save()
    res.status(200).json({msg:"settings updated successfully"})
})

router.post('/', verifyToken, async (req, res) => {
    Chat.create({
        participants:[req.user._id, req.body.userId],
        
    })
})

router.get('/messages/:id', verifyToken, async (req, res) => {
    const allMessages = await Message.find({chat:req.params.chatId}).toArray()
    res.status(200).json({messages:allMessages})
})

module.exports = router;

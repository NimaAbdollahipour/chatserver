import { Message } from "../schemas/message";
import { Chat } from "../schemas/chat"

async function handleChatConnection(socket){
    console.log(`${socket.user.username} connected!`);    
    socket.on('join',async (room)=>{
        const chat = await Chat.findOne({_id:room})
        const index = chat.participants.findIndex(item=>item.user===socket.user._id)
        chat.participants[index].inChat = true
        chat.participants[index].unreadMessages = 0
        await chat.save()
    })

    socket.on('leave',async (room)=>{
        const chat = await Chat.findOne({_id:room})
        const index = chat.participants.findIndex(item=>item.user===socket.user._id)
        chat.participants[index].inChat = false
        await chat.save()
    })

    socket.on('disconnect',()=>{
        console.log(`${socket.user.username} connected!`);
    })
}

export default handleChatConnection
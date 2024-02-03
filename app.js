const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user");
const usersRouter = require("./routes/users");
const chatRouter = require("./routes/chat");
const http = require('http');
const cors = require('cors');
const handleChatConnection = require("./utils/chatSocket")
const { Server } = require("socket.io");

require('dotenv').config({ path: '.env' });
mongoose.connect("mongodb://localhost/chatgram");

const app = express();
const port = 3300;
const httpServer = http.createServer(app);

const io = new Server(httpServer)
io.use(socketIoAuth)
io.on('connection',socket=>handleChatConnection(socket))

let corsOptions = {
    origin: ['http://localhost:5173']
}

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/user', userRouter);
app.use('/users', usersRouter);
app.use('/chat', chatRouter);

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

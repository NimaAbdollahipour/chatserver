const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user");
const usersRouter = require("./routes/users");
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

require('dotenv').config({ path: '.env' });
mongoose.connect("mongodb://localhost/chatgram");


const app = express();
const port = 3300;
const server = http.createServer(app);

let corsOptions = {
    origin: '*'
}
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/user', userRouter);
app.use('/users', usersRouter);

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user");


require('dotenv').config({ path: '.env' });
mongoose.connect("mongodb://localhost/chatgram");


const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use(cookieParser())
app.use('/user', userRouter);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

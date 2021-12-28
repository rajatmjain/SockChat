const express = require("express");
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname,'public')));

//Run when a client connects
io.on('connection',socket=>{
    console.log("Someone connected");
    socket.emit('message','Welcome to SockChat');

    // Broadcast when a user connects
    socket.broadcast.emit('message',"New user has joined the chat");

    //Broadcast when a user disconnects
    socket.on('disconnect',()=>{
        io.emit('message',"A user has left the chat");
    });



});

const PORT = 3000 || process.env.PORT;
server.listen(PORT,()=> console.log(`Server up and running on port ${PORT}!`));
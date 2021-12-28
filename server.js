const express = require("express");
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const socketio = require('socket.io');
const io = socketio(server);
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');

//Set static folder
app.use(express.static(path.join(__dirname,'public')));
const botName = "SockChat Bot";

//Run when a client connects
io.on('connection',(socket) => {
    socket.on('joinRoom',({username,room})=>{
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);

        socket.emit('message',formatMessage(botName,`Welcome to ${user.room}`));
        socket.broadcast
        .to(user.room)
        .emit(
            'message',
            formatMessage(botName,`${user.username} has joined the chat`)
        );

        // Send user and room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users : getRoomUsers(user.room)
        });
    });

    // Listen for new message
    socket.on('chatMessage',(msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

    //Broadcast when a user disconnects
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
        }

        // Send user and room info
        io.to(user.room).emit('roomUser',{
            room:user.room,
            users : getRoomUsers(user.room)
        });
    });

    
});



const PORT = 3000 || process.env.PORT;
server.listen(PORT,()=> console.log(`Server up and running on port ${PORT}!`));
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io"); 
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/chatApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });

app.use(cors());




const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
const rooms = {};

  const chatSchema = new mongoose.Schema({
    username: String,
    message: String,
    room:String,
  });
  const Chat = mongoose.model('Chat', chatSchema);
 
  const userRegister = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
    },
    password: String,
    friends:[String],
  });
  const user = mongoose.model('userRegister', userRegister);

var members=[["",""]];
io.on("connection", (socket) => {
    console.log(`user connected ${socket.id}`);

   
    socket.on("receiveRegister", (data)=>
    {
    const newUser=new user(
      {
        username: data.username,
        password: data.password,
      }
    )
    console.log(newUser);
    newUser.save().then(() => {
      socket.emit('alert','registered succesfully')
    }).catch((error) => {

   socket.emit('alert','Username taken')
    })

    })
socket.on("updateFriend",(username)=>
{

user.findOne({ username })
.then((user) => {
  if (user) {
    const friends = user.friends;
    console.log('Friends list:', friends);
    socket.emit("getBff",friends);
  } else {
    console.log('User not found');
  }
})
.catch((error) => {
  console.error('Error retrieving friends list:', error);
});


}


)
socket.on("checkLogin",(data)=>
{
const { username, password } = data;
user.findOne({ username,password})
.then((user) => {
if (user) {
  socket.emit("loginSuccess", "success");

} else {
  socket.emit("loginSuccess", "fail");

}
})
.catch((error) => {
console.error("Failed to check login:", error);
socket.emit("loginError", "An error occurred");
});
})


socket.on("ppj",(data)=>
{
console.log(data);
})
socket.on("trigger",(data)=>
{
var senddata=[["",""]];

Chat.find({ room:data })
.then((messages) => {
console.log('Retrieved messages from John:', messages[0].message);
messages.forEach((message) => {
  senddata.push([message.username, message.message]);
  
}

);
console.log(senddata);
socket.emit("restore",senddata);

}
)
.catch((error) => {
console.log(data);
console.error('Failed to retrieve messages:', error);
});

}
)

    socket.on("join_room", (data) => {
        socket.join(data.room);
        console.log(`room name:${data.room}`);
        if (!rooms[data.room]) {
            rooms[data.room] = []; 
          }
          rooms[data.room].push([socket.id, data.username]);

          io.to(data.room).emit("receive_username", rooms[data.room]);
          
          
        //socket.to(data.room).emit("receive_username", data);

      });

      socket.on("sendFriend", async (data) => {
        const { username, friend } = data;
      
        try {
          const updatedUser = await user.findOneAndUpdate(
            { username: username },
            { $addToSet: { friends: friend } },
            { new: true }
          );
          console.log('Friend added successfully:', updatedUser);
        } catch (error) {
          console.error('Failed to add friend:', error);
        }
      });
      




    socket.on("send_message",(data)=>
    {

        const chat = new Chat({
            username: data.writer,
            message: data.message,
            room:data.room,
          });
          chat.save().then(() => {
            console.log('success')
          }).catch((error) => {
            console.log('failure',error)
          })
        socket.to(data.room).emit("receive_message",data);  



    })
   socket.on("leave",(data)=>
   {
    for (const room in rooms) {
        rooms[room] = rooms[room].filter((member) => member[1] !== data);
        io.to(room).emit("receive_username", rooms[room]);
   }})
   socket.on("disconnect", () => {
       console.log(    `${socket.id} left`);
       for (const room in rooms) {
        rooms[room] = rooms[room].filter((member) => member[0] !== socket.id);
        io.to(room).emit("receive_username", rooms[room]);
      }
  
       

    });

                            

});

server.listen(3002, () => {
    console.log("simon entered");
});

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./route/auth");
const messageRoutes = require("./route/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();
const corsOptions = {
  origin: "http://localhost:3000", // Replace with the origin of your React app
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(5000, () =>{
  console.log("Server started on 5000");
}
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});
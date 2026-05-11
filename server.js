const PASSWORD = "77068090";
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// sirf 2 users allow
let usersInRoom = 0;

io.on("connection", (socket) => {
  if (usersInRoom >= 2) {
    socket.disconnect();
    return;
  }

  usersInRoom++;

  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    usersInRoom--;
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});

io.on("connection", (socket) => {

  socket.on("login", (pass) => {
    if (pass !== PASSWORD) {
      socket.disconnect();
    }
  });

  if (usersInRoom >= 2) {
    socket.disconnect();
    return;
  }

  usersInRoom++;

  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    usersInRoom--;
  });

});

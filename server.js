const PASSWORD = "77068090";
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname))); // serve index.html

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let usersInRoom = 0;

io.on("connection", (socket) => {

  // login password
  socket.on("login", (pass) => {
    if (pass !== PASSWORD) {
      socket.disconnect();
    }
  });

  // only 2 users allowed
  if (usersInRoom >= 2) {
    socket.disconnect();
    return;
  }

  usersInRoom++;

  // message handling
  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  // disconnect handling
  socket.on("disconnect", () => {
    usersInRoom--;
  });

});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});

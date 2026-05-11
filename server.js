const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PASSWORD = "77068090";

app.use(express.static(path.join(__dirname)));

let users = 0;

io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("login", (pass) => {

    if (pass !== PASSWORD) {
      console.log("Wrong password");
      socket.disconnect();
      return;
    }

    if (users >= 2) {
      console.log("Room full");
      socket.disconnect();
      return;
    }

    users++;

    console.log("Login success");

    socket.on("message", (msg) => {
      console.log("Message:", msg);

      io.emit("message", msg);
    });

    socket.on("disconnect", () => {
      users--;
      console.log("User disconnected");
    });

  });

});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

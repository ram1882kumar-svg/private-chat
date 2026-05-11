<!DOCTYPE html>
<html>
<head>
  <title>Private Chat</title>

  <style>

    body{
      margin:0;
      height:100vh;
      display:flex;
      justify-content:center;
      align-items:center;
      background:#0b1220;
      font-family:Arial;
    }

    /* FULL SCREEN BACKGROUND FIX */
    body::before{
      content:"";
      position:absolute;
      top:0; left:0;
      width:100%;
      height:100%;
      background:linear-gradient(135deg,#0f172a,#111827);
      z-index:-1;
    }

    /* PHONE SIZE BOX */
    .chat-box{
      width:340px;
      height:550px;
      background:#1f2937;
      border-radius:20px;
      display:flex;
      flex-direction:column;
      overflow:hidden;
      box-shadow:0 0 25px rgba(0,0,0,0.6);
    }

    .top{
      background:#2563eb;
      color:white;
      padding:15px;
      text-align:center;
      font-size:18px;
      font-weight:bold;
    }

    #chat{
      flex:1;
      padding:10px;
      overflow-y:auto;
      color:white;
    }

    .msg{
      padding:8px 12px;
      margin:6px;
      border-radius:12px;
      width:fit-content;
      max-width:70%;
      font-size:14px;
    }

    .me{
      background:#2563eb;
      margin-left:auto;
    }

    .other{
      background:#374151;
    }

    .bottom{
      display:flex;
      padding:10px;
      background:#111827;
    }

    #msg{
      flex:1;
      padding:10px;
      border:none;
      border-radius:10px;
      outline:none;
    }

    button{
      margin-left:5px;
      padding:10px;
      border:none;
      border-radius:10px;
      background:#2563eb;
      color:white;
      cursor:pointer;
    }

  </style>

</head>

<body>

<div class="chat-box">

  <div class="top">🔒 Private Chat</div>

  <div id="chat"></div>

  <div class="bottom">
    <input id="msg" placeholder="Type message">
    <button onclick="send()">Send</button>
  </div>

</div>

<script src="/socket.io/socket.io.js"></script>

<script>

const socket = io();

const password = prompt("Enter password");

socket.emit("login", password);

// ONLY RECEIVE FROM SERVER
socket.on("message", (msg) => {

  const chat = document.getElementById("chat");

  chat.innerHTML += `<div class="msg other">${msg}</div>`;

  chat.scrollTop = chat.scrollHeight;

});

// SEND ONLY (NO LOCAL PRINT)
function send(){

  const input = document.getElementById("msg");
  const msg = input.value.trim();

  if(!msg) return;

  socket.emit("message", msg);

  input.value = "";
}

</script>

</body>
</html>
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

// Store messages until seen
let messages = [];

io.on("connection", (socket) => {

  // login password
  socket.on("login", (pass) => {
    if (pass !== PASSWORD) {
      socket.disconnect();
      return;
    }

    // send old messages
    messages.forEach(m => {
      socket.emit("message", m);
    });
  });

  // only 2 users allowed
  if (usersInRoom >= 2) {
    socket.disconnect();
    return;
  }

  usersInRoom++;

  // message handling
  socket.on("message", (msg) => {
    const data = { text: msg, seen: false };
    messages.push(data);
    io.emit("message", data);
  });

  // message seen by client
  socket.on("seen", (text) => {
    messages = messages.filter(m => m.text !== text);
  });

  // disconnect handling
  socket.on("disconnect", () => {
    usersInRoom--;
  });

});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});

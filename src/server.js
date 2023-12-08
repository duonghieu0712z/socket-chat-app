const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        credentials: true,
    },
});

io.on("connection", (socket) => {
    let user = {};
    socket.on("user", (data) => {
        connectUser(data.userName, socket);
        user = { ...data };
        // io.emit("user", data);
    });

    socket.on("chat", (data) => {
        console.log({ ...user, ...data });
        io.emit("chat", { id: socket.id, ...user, ...data });
    });

    socket.on("disconnect", () => {
        disconnectUser(socket);
    });
});

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});

const socketMap = {};
const users = [];

function connectUser(username, socket) {
    if (!(username in socketMap)) {
        socket.username = username;
        socketMap[username] = socket;
        users.push(username);
        console.log("<Online Users>: ", users);
    }
}

function disconnectUser(socket) {
    if (socket.username in socketMap) {
        console.log("- User (%s) Disconnected.", socket.username);
        delete socketMap[socket.username];
        users.splice(users.indexOf(socket.username), 1);
        console.log("<Online Users>: ", users);
    }
}

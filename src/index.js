// Create express app
// We want all the goodies of ES6- ES7
import express from "express";
import path from "path";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import socketIo from "socket.io";

import auth from "./routes/auth";
import users from "./routes/users";
import weather from "./routes/weather";
import golfclub from "./routes/golfclub";
import friends from "./routes/friends";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
mongoose.connect(process.env.MONGODB_URL);

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/weather", weather);
app.use("/api/friends", friends);
app.use("/api/golfclub", golfclub);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// const getApiAndEmit = async socket => {
//   socket.emit("FromAPI", "Hello there");
// };

// let interval;
// io.on("connection", socket => {
//   const nick = socket.handshake.query.nick;
//   console.log("New client connected");
//   console.log(nick);
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(() => getApiAndEmit(socket), 10000);
//   socket.on("disconnect", () => console.log("Client disconnected"));
// });

server.listen(port, () => console.log(`Running on localhost:${port}}`));

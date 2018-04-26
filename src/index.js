// Create express app
// We want all the goodies of ES6- ES7
import express from "express";
import path from "path";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import auth from "./routes/auth";
import users from "./routes/users";
import weather from "./routes/weather";
import golfclub from "./routes/golfclub";
import friends from "./routes/friends";

dotenv.config();
const app = express();
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

app.listen(8080, () => console.log("Running on localhost:8080"));

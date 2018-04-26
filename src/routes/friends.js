import express from "express";
import parseErrors from "../utils/parseErrors";
import User from "../models/User";
import Friend from "../models/Friend";

const router = express.Router();

router.post("/", (req, res) => {
  const { email } = req.body.user;
  res.json(email);
});

router.post("/find", (req, res) => {
  const { hcp } = req.body.user;

  const user = req.body.user;
  user.setHCP(hcp);
  user
    .save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.post("/add", (req, res) => {
  const { user } = req.body;
  const { friend } = req.body;
  User.findOne({ email: user.email }).then(requesting => {
    if (!requesting) {
      res.status(400).json();
    } else {
      User.findOne({ email: friend }).then(requested => {
        if (!requested) {
          res.status(400).json({ error: "Could not find user" });
        } else {
          const friendship = new Friend(user, friend);
          // to do: push recieved friend request
          friendship.save();
        }
      });
    }
  });
});

export default router;

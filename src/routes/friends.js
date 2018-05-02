import express from "express";
import parseErrors from "../utils/parseErrors";
import User from "../models/User";
import Friend from "../models/Friend";

const router = express.Router();

router.post("/", (req, res) => {
  const { email } = req.body.user;
  res.json(email);
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

router.post("/respond", (req, res) => {
  const { user, friend, response } = req.body;
  Friend.findOne({ requesting: friend }, { requested: user }).then(
    friendship => {
      User.findOne({ email: friend.email }).then(theFriend => {
        if (theFriend) {
          User.findOne({ email: user.email }).then(theUser => {
            if (theUser) {
              if (response) {
                theUser.addFriend(theFriend);
                theFriend.addFriend(theUser);
                friendship.setAccept();
                res.json({ data: "Friendship approved" });
              } else {
                // Declined
                Friend.findOneAndRemove({ _id: friendship._id });
                res.json({ data: "Friendship declined" });
              }
            } else {
              // No user
              res.status(400).json({ error: "No such user" });
            }
          });
        } else {
          // No friend
          res.status(400).json({ error: "No such friend" });
        }
      });
    }
  );
});

export default router;

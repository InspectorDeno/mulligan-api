import express from "express";
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
          res
            .status(400)
            .json({ errors: { add_friend: "Could not find user" } });
        } else {
          Friend.findOne({
            requesting: requesting._id,
            requested: requested._id
          }).then(alreadyFriends => {
            if (alreadyFriends) {
              res
                .status(400)
                .json({ errors: { add_friend: "You can't add this friend" } });
            } else {
              const friendship = new Friend({
                requesting: requesting._id,
                requested: requested._id
              });
              friendship.save();
              res.json({ friendData: { message: "Friend request sent!" } });
            }
          });
          // to do: push recieved friend request
        }
      });
    }
  });
});

router.post("/respond", (req, res) => {
  const { user, friend, response } = req.body;

  User.findOne({ email: friend.email })
    .then(theFriend => {
      if (theFriend) {
        User.findOne({ email: user.email }).then(theUser => {
          if (theUser) {
            Friend.findOne(
              { requesting: theFriend._id },
              { requested: theUser._id }
            ).then(friendship => {
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
            });
          } else {
            // No user
            res.status(400).json({ errors: { respond: "No such user" } });
          }
        });
      } else {
        // No friend
        res.status(400).json({ errors: { respond: "No such friend" } });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

export default router;

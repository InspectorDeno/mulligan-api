import express from "express";
import User from "../models/User";
import Friend from "../models/Friend";

const router = express.Router();

router.post("/", (req, res) => {
  const {
    email
  } = req.body.user;
  res.json(email);
});

router.post("/add", (req, res) => {
  const {
    user
  } = req.body;
  const {
    friend
  } = req.body;
  User.findOne({
    username: user.username
  }).then(requesting => {
    if (!requesting) {
      res.status(400).json();
    } else {
      User.findByWhatever(friend).then(requestedObj => {
        const requested = requestedObj[0];
        if (!requested) {
          res
            .status(400)
            .json({
              errors: {
                add_friend: "Could not find user"
              }
            });
        } else {
          Friend.findOne({
            requesting: requesting._id,
            requested: requested._id
          }).then(alreadyFriends => {
            if (alreadyFriends) {
              res
                .status(400)
                .json({
                  errors: {
                    add_friend: "Friend request already sent"
                  }
                });
            } else {
              const friendship = new Friend({
                requesting: requesting._id,
                requested: requested._id
              });
              friendship.save();
              res.json({
                add_friend: {
                  message: "Friend request sent!"
                }
              });
              // TODO: push pending over sockets?
            }
          });
        }
      });
    }
  });
});

router.post("/respond", (req, res) => {
  const {
    user,
    friend,
    response
  } = req.body;

  User.findOne({
      email: friend.email
    })
    .then(theFriend => {
      if (theFriend) {
        User.findOne({
          email: user.email
        }).then(theUser => {
          if (theUser) {
            Friend.findOne({
                requesting: theUser._id
              }, {
                requested: theFriend._id
              })
              .then(friendship => {
                if (response) {
                  theUser.addFriend(theFriend);
                  theFriend.addFriend(theUser);
                  friendship.setAccept();
                  theUser.save();
                  theFriend.save();
                  friendship.save();
                  res.json({
                    data: "Friendship approved"
                  });
                } else {
                  // Declined
                  Friend.findOneAndRemove({
                    _id: friendship._id
                  });
                  res.json({
                    data: "Friendship declined"
                  });
                }
              })
              .catch(err => {
                console.log(err);
              });
          } else {
            // No user
            res.status(400).json({
              errors: {
                respond: "No such user"
              }
            });
          }
        });
      } else {
        // No friend
        res.status(400).json({
          errors: {
            respond: "No such friend"
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

export default router;
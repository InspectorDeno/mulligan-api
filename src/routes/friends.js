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
  const { user } = req.body;
  const { friend } = req.body;
  User.findOne({
    username: user.username
  }).then(requesting => {
    if (!requesting) {
      res.status(400).json();
    } else {
      User.findOne({ username: friend }).then(requested => {
        if (!requested) {
          res
            .status(400)
            .json({
              errors: {
                add_friend: "Could not find user"
              }
            });
        } else {
          // See if friend request was already sent
          Friend.findOne(
            { requesting: requesting.email, requested: requested.email }
          ).then(alreadyPending => {
            if (alreadyPending) {
              console.log("1", alreadyPending);;
              res
                .status(400)
                .json({
                  errors: {
                    add_friend: "Friend request already sent"
                  }
                });
            } else {
              // See if request is already pending
              Friend.findOne({ requesting: requested.email, requested: requesting.email })
                .then(alreadyPending2 => {
                  if (alreadyPending2) {
                    console.log("2", alreadyPending);
                    res
                      .status(400)
                      .json({
                        errors: {
                          add_friend: "Friend request already received"
                        }
                      });
                  } else {
                    // Add new pending friendship
                    const friendship = new Friend({
                      requesting: requesting.email,
                      requested: requested.email
                    });
                    friendship.save();
                    res.json({
                      add_friend: {
                        message: "Friend request sent!"
                      }
                    });
                  }
                });
            }
          });
          // TODO: push pending over sockets?
        }
      });
    }
  });
});

router.post("/respond", (req, res) => {
  const { user, friend, response } = req.body;

  // Find the friend
  User.findOne({ username: friend })
    .then(theFriend => {
      if (theFriend) {
        // Find the user
        User.findOne({ username: user })
          .then(theUser => {
            if (theUser) {
              // Find unaccepted friendship
              Friend.findOne({ requesting: theFriend.email, requested: theUser.email })
                .then(friendship => {
                  // User accepted friend

                  if (response) {
                    theUser.addFriend(theFriend);
                    theUser.save();
                    theFriend.addFriend(theUser);
                    theFriend.save();
                    res.json({
                      respondData: {
                        message: "Friendship approved"
                      }
                    });
                  } else {
                    // Declined
                    res.json({
                      respondData: {
                        message: "Friendship declined"
                      }
                    });
                  }
                  // Removing pending friendship
                  friendship.remove();
                })
                .catch(() => {
                  res.status(400).json({
                    errors: { respond: "Not a pending friendship" }
                  })
                }
                );
            } else {
              // No user
              res.status(400).json({
                errors: { respond: "No such user" }
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
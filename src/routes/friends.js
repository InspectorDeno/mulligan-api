import express from "express";
import User from "../models/User";
import Friend from "../models/Friend";
import authenticate from "../middlewares/authenticate";

const router = express.Router();
router.use(authenticate);

router.post("/add", (req, res) => {
  const requesting = req.currentUser;
  const { friend } = req.body;
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
});

router.post("/respond", (req, res) => {
  const user = req.currentUser;
  const { friend, response } = req.body;

  // Find the friend
  User.findOne({ username: friend })
    .then(theFriend => {
      if (theFriend) {
        // Find unaccepted friendship
        Friend.findOne({ requesting: theFriend.email, requested: user.email })
          .then(friendship => {
            // User accepted friend

            if (response) {
              user.addFriend(theFriend);
              user.save();
              theFriend.addFriend(user);
              theFriend.save();
              res.json({
                respondData: {
                  message: "Friend added"
                }
              });
            } else {
              // Declined
              res.json({
                respondData: {
                  message: "Friend declined"
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
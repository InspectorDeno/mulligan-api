import express from "express";
import User from "../models/User";
import Friend from "../models/Friend";
import parseErrors from "../utils/parseErrors";
import { sendConfirmationEmail } from "../mailer";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, username, password, gender } = req.body.user;
  const user = new User({ email, username, gender });

  user.setPassword(password);
  user.setConfirmationToken();
  user
    .save()
    .then(newUser => {
      sendConfirmationEmail(newUser);
      res.json({
        user: newUser.toAuthJSON()
      });
    })
    .catch(err => {
      res.status(400).json({
        errors: parseErrors(err.errors)
      })
    });
});

router.post("/sethcp", (req, res) => {
  const { hcp } = req.body;
  const { user } = req.body;
  User.findOne({ username: user.username }).then(theUser => {
    if (theUser) {
      theUser.setHCP(hcp);
      theUser.save()
      res.json({ user: theUser.toAuthJSON() });
    } else {
      res.status(400).json({ errors: { sethcp: "Failed to set hcp" } })
    }
  })
});

router.post("/find", (req, res) => {
  const { user } = req.body;
  User.findByWhatever(user.username_email)
    .then(users => {
      const theUser = users[0];
      if (theUser) {
        res.json({
          userData: theUser.toGeneric()
        });
      } else {
        res.status(400).json({
          errors: {
            find_user: "No such user"
          }
        });
      }
    })
    .catch(() =>
      res.status(400).json({
        errors: {
          find_user: "Failed to find user"
        }
      })
    );
});

router.post("/get_pending", (req, res) => {
  const { user } = req.body;
  const response = [];
  User.findOne({
    username: user
  }).then(theUser => {
    // Find pending friendships if they exist
    Friend.find({ requested: theUser.email }).then(pending => {
      if (pending.length > 0) {
        pending.forEach(pend => {
          // Find the friend 
          User.findOne({ email: pend.requesting }).then(theOneAsking => {
            // Add to response
            response.push(theOneAsking.toGeneric());
            if (response.length === pending.length) {
              // Respond with list of pending friends
              res.json({
                pendingData: {
                  data: response
                }
              });
            }
          }
          );
        })
      } else {
        // No pending friends
        res.json({ pendingData: {} });
      }
    }).catch(() => res.status(400).json({ errors: { get_pending: "Failed to get pending friends" } }));
  });
});

router.post("/get_friends", (req, res) => {
  const { user } = req.body;
  const response = [];

  User.findOne({
    username: user
  }).then(theUser => {
    if (theUser) {
      if (theUser.friends.length > 0) {
        theUser.friends.forEach(f => {
          User.findOne({
            email: f.email
          }).then(friend => {
            response.push(friend.toGeneric());
            if (response.length === theUser.friends.length) {
              res.json({
                friendData: {
                  data: response
                }
              });
            }
          });
        });
      } else {
        // No friends
        res.json({ friendData: {} });
      }
    } else {
      res.status(400).json({
        errors: {
          global: "User doesn't exist"
        }
      });
    }
  });
});

export default router;
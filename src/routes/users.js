import express from "express";
import User from "../models/User";
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
      res.json({ user: newUser.toAuthJSON() });
    })
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.post("/sethcp", (req, res) => {
  const { hcp } = req.body.user;
  const user = req.body.user;
  user.setHCP(hcp);
  user
    .save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.post("/find", (req, res) => {
  const { user } = req.body;
  User.findOne({ email: user.email }).then(theUser => {
    if (theUser) {
      res.json({ userData: theUser });
    } else {
      res.status(400).json({ errors: { find_user: "No such user" } });
    }
  });
});

router.post("/get_friends", (req, res) => {
  const { user } = req.body;
  const response = [];

  User.findOne({ email: user.email }).then(theUser => {
    if (theUser) {
      if (theUser.friends) {
        if (theUser.friends.length > 0) {
          theUser.friends.forEach(f => {
            User.findById({ _id: f._id }).then(friend => {
              const friendObj = {
                email: friend.email,
                hcp: friend.hcp
              };
              response.push(friendObj);
              if (response.length === theUser.friends.length) {
                res.json({ friendData: { data: response } });
              }
            });
          });
        } else {
          res.status(400).json({
            errors: {
              get_friends: "You have no friends"
            }
          });
        }
      }
    } else {
      console.log("??");
      res.status(400).json({ errors: { get_friends: "User doesn't exist" } });
    }
  });
});

export default router;

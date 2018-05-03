import express from "express";
import User from "../models/User";
import parseErrors from "../utils/parseErrors";
import { sendConfirmationEmail } from "../mailer";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, password } = req.body.user;
  const user = new User({ email });
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

  User.findOne({ email: user.email }).then(theUser => {
    if (theUser) {
      if (theUser.friends) {
        const response = {};

        theUser.friends.forEach(f => {
          User.findById({ _id: f.id }).then(friend => response.add(friend));
        });
        if (response.length > 0) {
          res.json({ friendData: { data: response } });
        } else {
          res
            .status(400)
            .json({ errors: { get_friends: "You have no friends" } });
        }
      }
    } else {
      console.log("??");
      res.status(400).json({ errors: { get_friends: "User doesn't exist" } });
    }
  });
});

export default router;

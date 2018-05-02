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

router.post("/getFriends", (req, res) => {
  const { user } = req.body.user;
  user.find({ email: user }).then(theUser => {
    if (theUser) {
      const response = {};
      theUser.friends.array.forEach(f => {
        User.findById({ _id: f.id }).then(friend => response.add(friend));
      });
      console.log("repsons e is..,");
      console.log(response);
      if (response.length > 0) {
        res.json({ friendData: { data: response } });
      } else {
        res.json({ friendData: { message: "You have no friends" } });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }
  });
});

export default router;

import express from "express";
import User from "../models/User";
import Friend from "../models/Friend";
import parseErrors from "../utils/parseErrors";
import authenticate from "../middlewares/authenticate";
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
      });
    });
});

router.post("/sethcp", (req, res) => {
  const { user, hcp } = req.body;

  User.findOne({ email: user.email }).then(currentUser => {
    currentUser.setHCP(hcp);
    currentUser.save();
    res.json({ user: currentUser.toAuthJSON() });
  })
});

router.post("/find", (req, res) => {
  // user we're finding
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

router.post("/change_password", authenticate, (req, res) => {
  const currentUser = req.currentUser;
  const { newPassword } = req.body;

  currentUser.setPassword(newPassword.password);
  currentUser.save();
  res.json({});
});

router.post("/get_friends", authenticate, (req, res) => {
  const currentUser = req.currentUser;
  const response = [];

  if (currentUser.friends.length > 0) {
    currentUser.friends.forEach(f => {
      User.findOne({
        email: f.email
      }).then(friend => {
        response.push(friend.toGeneric());
        if (response.length === currentUser.friends.length) {
          res.json({ friendData: { data: response } });
        }
      });
    });
  } else {
    // No friends
    res.json({ friendData: {} });
  }
});

router.post("/get_pending", authenticate, (req, res) => {
  const currentUser = req.currentUser; // Retrieved from decoded header

  const response = [];
  // Find pending friendships if they exist
  Friend.find({ requested: currentUser.email })
    .then(pending => {
      if (pending.length > 0) {
        pending.forEach(pend => {
          // Find the friend
          User.findOne({ email: pend.requesting }).then(theOneAsking => {
            // Add to response
            response.push(theOneAsking.toGeneric());
            if (response.length === pending.length) {
              // Respond with list of pending friends
              res.json({ pendingData: { data: response } });
            }
          });
        });
      } else {
        // No pending friends
        res.json({ pendingData: {} });
      }
    })
    .catch(() =>
      res
        .status(400)
        .json({ errors: { get_pending: "Failed to get pending friends" } })
    );
});

export default router;

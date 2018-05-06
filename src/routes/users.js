import express from "express";
import User from "../models/User";
import parseErrors from "../utils/parseErrors";
import {
  sendConfirmationEmail
} from "../mailer";

const router = express.Router();

router.post("/", (req, res) => {
  const {
    email,
    username,
    password,
    gender
  } = req.body.user;
  const user = new User({
    email,
    username,
    gender
  });
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
    .catch(err => res.status(400).json({
      errors: parseErrors(err.errors)
    }));
});

router.post("/sethcp", (req, res) => {
  const { hcp } = req.body;
  const { user } = req.body;
  User.findOne({ username: user.username}).then(theUser => {
    if(theUser){
      theUser.setHCP(hcp);
      theUser.save()
      res.json({ user: theUser.toAuthJSON() });
    } else {
      res.status(400).json({ errors: { sethcp: "Failed to set hcp"}})
    }
  })
});

router.post("/find", (req, res) => {
  const {
    user
  } = req.body;
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

router.post("/get_friends", (req, res) => {
  const {
    user
  } = req.body;
  const response = [];

  User.findOne({
    email: user.email
  }).then(theUser => {
    if (theUser) {
      if (theUser.friends.length > 0) {
        theUser.friends.forEach(f => {
          User.findById({
            _id: f._id
          }).then(friend => {
            const friendObj = {
              email: friend.email,
              hcp: friend.hcp
            };
            response.push(friendObj);
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
        res.json({});
      }
    } else {
      console.log("??");
      res.status(400).json({
        errors: {
          get_friends: "User doesn't exist"
        }
      });
    }
  });
});

export default router;
import express from "express";
import User from "../models/User";
import parseErrors from "../utils/parseErrors";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, password } = req.body.user;
  const user = new User({ email });
  user.setPassword(password);
  user
    .save()
    .then(newUser => res.json({ user: newUser.toAuthJSON() }))
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.post("/sethcp", (req, res) => {
  const { hcp } = req.body.user;
  const user = req.body.user;
  user.setHCP(hcp);
  user.save()
  .then(() => res.json({ success: true}))
  .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }))
})

export default router;

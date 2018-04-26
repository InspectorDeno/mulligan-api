import express from "express";
import parseErrors from "../utils/parseErrors";

const router = express.Router();

router.post("/", (req, res) => {
  const { email } = req.body.user;
  res.json(email);
});

router.post("/find", (req, res) => {
  const { hcp } = req.body.user;

  const user = req.body.user;
  user.setHCP(hcp);
  user
    .save()
    .then(() => res.json({ success: true }))
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

export default router;

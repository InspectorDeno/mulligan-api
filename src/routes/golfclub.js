import express from "express";
import GolfHole from "../models/GolfHole";

const router = express.Router();

router.post("/", (req, res) => {
  const { clubName } = req.body;
  GolfHole.find({ club: `${clubName}` }).then(
    holes =>
      holes.length > 0
        ? res.json({ golfClubData: holes })
        : res
            .status(400)
            .json({ error: "Sorry, we don't have any data for that Golf Club" })
  );
});

export default router;

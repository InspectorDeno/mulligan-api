import express from "express";
import GolfHole from "../models/GolfHole";

const router = express.Router();

router.post("/", (req, res) => {
  const { clubName } = req.body;
  GolfHole.find({ club: `${clubName}` }).then(holes => {
    if (holes) {
      res.json({ golfClubData: holes });
    } else {
      res.status(400).json({ error: "Couldn't find that golf club" });
    }
  });
});

export default router;

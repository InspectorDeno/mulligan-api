import express from "express";
import User from "../models/User";
import authenticate from "../middlewares/authenticate"

const router = express.Router();

router.post("/add", authenticate, (req, res) => {
    // Add scorecard object
    const { data } = req.body;
    let response = {};

    data.golfplayers.forEach((player, index) => {
        User.findOne({ username: player.playerName })
            .then(theUser => {
                if (theUser) {
                    theUser.addScorecard(data);
                    theUser.save();
                    response = { scorecardData: "Scorecard added" };
                } else {
                    console.log("Didn't find a user with name ", player.playerName);
                }
                if (index === data.golfplayers.length - 1) {
                    console.log("response");
                    console.log(response);
                    res.json(response);
                }
            })
            .catch(() => {
                res.status(400).json({ scorecardData: "Failed to add scorecard" })
            })
    });
});

export default router;
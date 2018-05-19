import express from "express";
import request from "request-promise"
import moment from "moment";
import User from "../models/User";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

router.post("/", authenticate, (req, res) => {
    const currentUser = req.currentUser;
    // Return all scorecards
    res.json({ scorecardData: { data: currentUser.scorecards } })
})

router.post("/add", authenticate, (req, res) => {
    // Add scorecard object
    const { data } = req.body;
    let response = {};

    const lon = 15.6216; // Linköping
    const lat = 58.4109;
    const time = moment(data.golfdate).format("X");
    console.log(`${process.env.DARK_SKY_API}${process.env.DARK_SKY_KEY}/${lat},${lon},${time}?units=si&exclude=flags`)
    let weatherdata = { error: "No weather data for this round" };
    request.get(
        `${process.env.DARK_SKY_API}${process.env.DARK_SKY_KEY}/${lat},${lon},${time}?units=si&exclude=flags`
    ).then(wData => {
        weatherdata = JSON.parse(wData);
        data.golfplayers.forEach((player, index) => {
            User.findOne({ username: player.playerName })
                .then(theUser => {
                    if (theUser) {
                        theUser.addScorecard(data, weatherdata);
                        theUser.save();
                        response = { scorecardData: "Scorecard added" };
                    } else {
                        console.log("Didn't find a user with name ", player.playerName);
                    }
                    if (index === data.golfplayers.length - 1) {
                        res.json(response);
                    }
                })
                .catch(() => {
                    res.status(400).json({ scorecardData: "Failed to add scorecard" })
                })
        });
    })
});

export default router;
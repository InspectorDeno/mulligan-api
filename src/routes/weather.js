import express from "express";
import request from "request-promise";
import moment from "moment";

const router = express.Router();

router.get("/", (req, res) => {
  // TODO: Get lon and lat from user
  // TODO: Use capped collection to store weather data automatically for a certain amount of time
  const lon = 15.6216; // Linköping
  const lat = 58.4109;
  const time = moment(new Date(Date.now())).format("X");
  console.log(`${process.env.DARK_SKY_API}${process.env.DARK_SKY_KEY}/${lat},${lon},${time}?units=si&exclude=flags`
  )
  request
    .get(
      `${process.env.DARK_SKY_API}${process.env.DARK_SKY_KEY}/${lat},${lon},${time}?units=si&exclude=flags`
    )
    .then(result => {
      const data = JSON.parse(result);
      res.json({ weatherData: data });
    })
    .catch(() =>
      res.status(400).json({
        errors: "Failed to fetch weather data"
      })
    );
});

export default router;

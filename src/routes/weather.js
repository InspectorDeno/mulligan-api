import express from "express";
import request from "request-promise";

const router = express.Router();

router.get("/", (req, res) => {
  // TODO: Get lon and lat from user
  // TODO: Use capped collection to store weather data automatically for a certain amount of time
  request
    .get(
      `${process.env.SMHI_API}/category/pmp3g/version/2/geotype/point/lon/15.62157/lat/58.41086/data.json`
    )
    .then(result => {
      const data = JSON.parse(result);
      res.json({
        weatherData: data.timeSeries.map(item => ({
          validTime: item.validTime,
          degrees: item.parameters.filter(type => type.name === "t")[0]
            .values[0],
          windSpeed: item.parameters.filter(type => type.name === "ws")[0]
            .values[0],
          windDir: item.parameters.filter(type => type.name === "wd")[0]
            .values[0],
          symbol: item.parameters.filter(type => type.name === "Wsymb2")[0]
            .values[0],
          precMean: item.parameters.filter(type => type.name === "pmean")[0]
            .values[0],
          precCat: item.parameters.filter(type => type.name === "pcat")[0]
            .values[0]
        }))
      });
    })
    .catch(() =>
      res.status(400).json({
        errors: "Failed to fetch weather data"
      })
    );
});

export default router;

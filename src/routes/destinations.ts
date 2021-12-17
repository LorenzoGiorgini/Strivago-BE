import express from "express";
import { AdminCheckMiddleware } from "../middlewares/AdminCheckMiddleware";
import { JWTAuthMiddleware } from "../middlewares/JWTAuthMiddleware";
import AccomodationSchema from "../model/accomodation";
import DestinationSchema from "../model/destination";

const { Router } = express;

const router = Router();

router
  .route("/")
  .post(JWTAuthMiddleware , AdminCheckMiddleware, async (req, res) => {
    try {
      const alreadyHere = await DestinationSchema.find({});
      
      const foundCity = alreadyHere.find(
        (destination) => destination.city === req.body.city
      );

      if (foundCity) {
        res.status(400).send({ message: "City already there" });

      } else {
        const destination = new DestinationSchema(req.body);

        if (destination) {
          await destination.save();

          res.status(201).send(destination);

        } else {
          res.status(404).send({ message: "destination not found" });

        }
      }
    } catch (error) {
      console.log(error);
    }
  })
  .get(JWTAuthMiddleware, async (req, res) => {
    try {
      const destinations = await DestinationSchema.find({});
      if (destinations) {
        res.status(200).send(destinations);

      } else {
        res.status(404).send({ message: "Accomodation not found" });

      }
    } catch (error) {
      res.status(500).send({ success: false, message: "Something went wrong" });

    }
  });

router.route("/:cityId").get(JWTAuthMiddleware, AdminCheckMiddleware ,async (req, res) => {
  try {
    const accomodations = await AccomodationSchema.find({
      city: req.params.cityId,
    });
    if (accomodations) {
      res.status(200).send(accomodations);
    } else {
      res.status(404).send("Accomodation not found");
    }
  } catch (error) {
    res.status(500).send({ success: false, message: "Something went wrong" });
  }
});


export default router;
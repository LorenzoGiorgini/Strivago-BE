import express from "express";
import { JWTAuthMiddleware } from "../middlewares/JWTAuthMiddleware";
import { RoleCheckMiddleware } from "../middlewares/RoleCheckMiddleware";
import AccomodationSchema from "../model/accomodation";

const { Router } = express;

const router = Router();

router
  .route("/")
  .get(JWTAuthMiddleware, async (req, res) => {
    try {
      const accommodations = await AccomodationSchema.find({}).populate({
        path: "city",
      });
      if (accommodations) {
        res.status(200).send(accommodations);
      } else {
        res.status(404).send({ message: "Accomodation not found" });
      }
    } catch (error) {
      console.log(error);
    }
  })
  .post(JWTAuthMiddleware, RoleCheckMiddleware, async (req, res) => {
    try {
      const accommodation = new AccomodationSchema(req.body);

      if (accommodation) {
        await accommodation.save();

        res.status(201).send(accommodation);
      } else {
        res.status(404).send({ message: "Accomodation not found" });
      }
    } catch (error) {
      console.log(error);
    }
  });

router
  .route("/:id")
  .get(JWTAuthMiddleware, async (req, res) => {
    try {
      const id = req.params.id;
      const accomodation = await AccomodationSchema.findById(id);
      if (accomodation) {
        res.send(accomodation);
      } else {
        res.status(404).send({ message: "Accomodation with ${id} not found" });
      }
    } catch (error) {
      console.log(error);
    }
  })
  .put(JWTAuthMiddleware, RoleCheckMiddleware, async (req, res) => {
    try {
      const id = req.params.id;

      const accomodation = await AccomodationSchema.findOne({
        user: req.body.user,
        _id: id,
      });

      if (accomodation) {
        const updatedAccomodation = await AccomodationSchema.findByIdAndUpdate(
          id,
          req.body,
          { new: true }
        );
        if (updatedAccomodation) {
          res.status(203).send(updatedAccomodation);
        } else {
          res
            .status(404)
            .send({ message: "Accomodation with ${id} not found" });
        }
      } else {
        res
          .status(404)
          .send({ success: false, message: "Accomodation not found" });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: "Something went wrong" });
    }
  })
  .delete(JWTAuthMiddleware, RoleCheckMiddleware, async (req, res) => {
    try {
      const id = req.params.id;

      const accomodation = await AccomodationSchema.findOne({
        user: req.body.user,
        _id: id,
      });

      if (accomodation) {
        const deleted = await AccomodationSchema.findByIdAndDelete(id);
        if (deleted) {
          res.status(204).send({});
        } else {
          res
            .status(404)
            .send({ message: "Accomodation with ${id} not found" });
        }
      } else {
        res
          .status(404)
          .send({ success: false, message: "Accomodation not found" });
      }
    } catch (error) {
      res.status(500).send({ success: false, message: "Something went wrong" });
    }
  });

  
export default router;
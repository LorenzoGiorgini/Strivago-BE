import express from "express";
import UserModel from "../model/users";
import { JWTauth, verifyRefreshToken } from "../tools/auth-tools";
import { Request, Response } from "express";
const { Router } = express;

const router = Router();

router.route("/login").post(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.checkCredentials(email, password);

    if (user) {
      const token = await JWTauth(user);

      res.status(200).send({ success: true, token });
    } else {
      res
        .status(404)
        .send({ success: false, message: "Credentials are not correct" });
    }
  } catch (error) {
    res.status(404).send({ success: false, error: error });
  }
});

router.route("/register").post(async (req: Request, res: Response) => {
  try {
    const createUser = new UserModel(req.body);

    if (createUser) {
      await createUser.save();

      const { accessToken, refreshToken } = await JWTauth(createUser);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "lax",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: "lax",
      });

      res.status(201).send({ success: true, user: createUser._id});
    } else {
      res.status(400).send({
        success: false,
        message: "Something Went Wrong in the creation of the user",
      });
    }
  } catch (error) {
    res.status(400).send({ success: false, error: error });
  }
});

router.route("/refreshToken").post(async (req : Request, res : Response) => {
  try {
    const { currentRefreshToken } = req.body;

    const { accessToken, refreshToken } = await verifyRefreshToken(currentRefreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
    });
    
  } catch (error) {
    res.status(404).send({ success: false, error: error });
  }
});
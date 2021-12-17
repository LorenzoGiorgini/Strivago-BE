import express from "express";
import bcrypt from "bcrypt";
import UserModel from "../model/users";
import { JWTauth, verifyRefreshToken } from "../tools/auth-tools";
import { Request, Response } from "express";
import { JWTAuthMiddleware } from "../middlewares/JWTAuthMiddleware";
const { Router } = express;

const router = Router();

const checkCredentials = async function (
  email: string,
  password: string
) {
  const user = await UserModel.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

router.route("/login").post(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await checkCredentials(email, password);

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

router.route("/me").get(JWTAuthMiddleware, async (req: any, res: Response) => {
  try {
    res.status(200).send({ success: true, user: req.user });
  } catch (error) {
    res.status(404).send({ success: false, error: error });
  }
})

router.route("/register").post(async (req: Request, res: Response) => {
  try {
    const createUser = new UserModel(req.body);

    if (createUser) {
      await createUser.save();

      const tokens = await JWTauth(createUser);

      res.status(201).send({ success: true, user: createUser._id, tokens });
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

router.route("/refreshToken").post(async (req: Request, res: Response) => {
  try {
    const { currentRefreshToken } = req.body;

    const { accessToken, refreshToken } = await verifyRefreshToken(
      currentRefreshToken
    );

    res.status(200).send({ success: true, accessToken, refreshToken });
  } catch (error) {
    res.status(404).send({ success: false, error: error });
  }
});



export default router;
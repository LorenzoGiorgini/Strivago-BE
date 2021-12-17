import UserModel from "../model/users";

import { verifyNormalJWT } from "../tools/auth-tools";
import { Request, Response, NextFunction } from "express";

export const JWTAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    res.status(401).send({
      success: false,
      message: "Please provide token in Authorization header!",
    });
  } else {
    try {
      const token = req.headers.authorization.split(" ")[1];

      const decodedToken: any = await verifyNormalJWT(token);

      const user = await UserModel.findById(decodedToken);

      if (user) {
        req.user = user;

        next();
      } else {
        res.status(404).send({ success: false, message: "User not found" });
      }
    } catch (error) {
      res.status(401).send({ success: false, message: "Not authorized" });
    }
  }
};
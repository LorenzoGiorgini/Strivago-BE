import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import IUser from "../interfaces/IUser";

import { UserModel } from "../model/users";

export const JWTauth = async (user: IUser & Document) => {
  const accessToken = await generateJWTToken({ _id: user._id });
  const refreshToken = await generateRefreshJWTToken({ _id: user._id });

  user.refreshToken = refreshToken;

  await user.save();

  return { accessToken, refreshToken };
};

const generateJWTToken = (payload: StrivagoJwt) =>
  new Promise<string>((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token!);
      }
    )
  );

const generateRefreshJWTToken = (payload: StrivagoJwt) =>
  new Promise<string>((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        else resolve(token!);
      }
    )
  );

type StrivagoJwt = {
  _id: string;
};

export const verifyNormalJWT = (token: string) =>
  new Promise<StrivagoJwt>((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET!, (err, decodedToken) => {
      if (err) reject(err);
      else resolve(decodedToken as StrivagoJwt);
    })
  );

export const verifyRefreshJWT = (token: string) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET!, (err, decodedToken) => {
      if (err) reject(err);
      else resolve(decodedToken);
    })
  );

export const verifyRefreshToken = async (currentRefreshToken: string) => {
  const decodedRefreshToken: any = await verifyRefreshJWT(currentRefreshToken);

  const user = await UserModel.findById(decodedRefreshToken._id);

  if (!user) throw new Error("User not found!");

  if (user.refreshToken && user.refreshToken === currentRefreshToken) {
    const { accessToken, refreshToken } = await JWTauth(user);

    return { accessToken, refreshToken };
  } else {
    throw new Error("Token not valid!");
  }
};

import mongoose, { Document, Model, Models } from "mongoose";
import bcrypt from "bcrypt";
import IUser from "../interfaces/IUser";

const { Schema, model } = mongoose;

interface UserModel extends Model<IUser> {
  checkCredentials(email: string, password: string): Promise<IUser & Document | null>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["host", "guest"] },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const newUser = this;

  const password = newUser.password;

  if (newUser.isModified("password")) {
    const hash = await bcrypt.hash(password, 10);

    newUser.password = hash;
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const userDocument = this;

  const user = userDocument.toObject();

  delete user.password;

  delete user.__v;

  return user;
};

UserSchema.statics.checkCredentials = async function (
  email: string,
  password: string
) {
  const user = await this.findOne({ email });

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

export const UserModel = model<IUser, UserModel>("User", UserSchema);
import mongoose, { Models } from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;



const UserModel = new Schema(
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

UserModel.pre("save", async function (next) {
  const newUser = this;

  const password = newUser.password;

  if (newUser.isModified("password")) {
    const hash = await bcrypt.hash(password, 10);

    newUser.password = hash;
  }
  next();
});

UserModel.methods.toJSON = function () {
  const userDocument = this;

  const user = userDocument.toObject();

  delete user.password;

  delete user.__v;

  return user;
};

/* UserModel.statics.checkCredentials = async function (
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
}; */

export default model("User", UserModel);
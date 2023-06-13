import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    urls: [
      {
        type: Schema.Types.ObjectId,
        ref: "URLs"
      }
    ]
  },
  { collection: "User" }
);

const User = mongoose.model("User", userSchema);

export default User;

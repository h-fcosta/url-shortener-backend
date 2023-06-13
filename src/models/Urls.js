import mongoose, { Schema } from "mongoose";
import shortId from "shortid";

const urlsSchema = new mongoose.Schema(
  {
    original_url: { type: String, required: true },
    short_url: { type: String, required: true, default: shortId.generate },
    createdAt: { type: Date, default: Date.now() },
    user: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { collection: "URLs" }
);

const Urls = mongoose.model("URLs", urlsSchema);

export default Urls;

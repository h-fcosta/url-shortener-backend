import mongoose from "mongoose";

const tokensSchema = new mongoose.Schema({
  token_blacklist: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() }
});

const TokensBlacklist = mongoose.model("Blacklist", tokensSchema);

export default TokensBlacklist;

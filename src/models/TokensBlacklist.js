import mongoose from "mongoose";

const tokensBlacklistSchema = new mongoose.Schema({
  revokedToken: { type: String, required: true },
  blacklistDate: { type: Date, default: Date.now() }
});

const TokensBlacklist = mongoose.model(
  "TokensBlacklist",
  tokensBlacklistSchema
);

export default TokensBlacklist;

import mongoose from "mongoose";
import dotEnv from "dotenv";

dotEnv.config();

mongoose.connect(process.env.DB_URI);

let db = mongoose.connection;

export default db;

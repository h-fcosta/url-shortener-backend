import express from "express";
import dotEnv from "dotenv";
import db from "./src/config/dbConnect.js";
import routes from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotEnv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
routes(app);

app.listen(PORT, () => {
  console.log(`SERVIDOR OUVINDO NA PORTA: ${PORT}`);
});

db.on("error", console.log.bind(console, "Erro de conexão"));
db.once("open", () => {
  console.log("Conexão com banco de dados feita com sucesso!");
});

export default app;

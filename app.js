import express from "express";
import dotEnv from "dotenv";
import db from "./src/config/dbConnect.js";
import routes from "./src/routes/index.js";
import cookieParser from "cookie-parser";

dotEnv.config();

const app = express();
const port = process.env.PORT || 3001;
const host = "0.0.0.0";

app.use(express.json());
app.use(cookieParser());
routes(app);

app.listen(port, host, () => {
  console.log(`SERVIDOR OUVINDO EM http://localhost:${port}`);
});

db.on("error", console.log.bind(console, "Erro de conexão"));
db.once("open", () => {
  console.log("Conexão com banco de dados feita com sucesso!");
});

export default app;

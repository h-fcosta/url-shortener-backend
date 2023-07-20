import express from "express";
import urls from "./urlsRoutes.js";
import auth from "./authRoutes.js";

const routes = (app) => {
  app.route("/").get((req, res) => {
    res.status(200).json({ message: "Encurtador de URLS...em progresso." });
  });
  app.use(express.json(), urls, auth);
};

export default routes;

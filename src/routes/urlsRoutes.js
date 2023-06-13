import express from "express";
import UrlsController from "../controllers/urlsController.js";
import { authenticateToken } from "../controllers/middleware.js";

const router = express.Router();

router
  .get("/getUrls", authenticateToken, UrlsController.getUrls)
  .post("/newUrl", authenticateToken, UrlsController.originalUrl)
  .delete("/deleteUrl/:idUrl", authenticateToken, UrlsController.removeUrl)
  .put("/editUrl/:shortUrl", authenticateToken, UrlsController.editOriginalUrl)
  .get("/:shortUrl", UrlsController.shortUrl);

export default router;

import express from "express";
import UrlsController from "../controllers/urlsController.js";
import { authenticateToken } from "../controllers/middleware.js";

const router = express.Router();

router
  .get("/getAllUrls", UrlsController.getAllUrls)
  .get("/getUrls", authenticateToken, UrlsController.getUrls)
  .post("/newUrl", authenticateToken, UrlsController.originalUrl)
  .delete("/deleteUrl/:idUrl", authenticateToken, UrlsController.removeUrl)
  .put("/editUrl/:idUrl", authenticateToken, UrlsController.editOriginalUrl)
  .put(
    "/editShortenedUrl/:idUrl",
    authenticateToken,
    UrlsController.editShortenedUrl
  )
  .get("/api/:shortUrl", UrlsController.shortUrl);

export default router;

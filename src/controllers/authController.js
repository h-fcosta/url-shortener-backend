import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import redisClient from "../config/redis.js";
import User from "../models/User.js";
import { validateRegisterInput, validateLoginInput } from "./middleware.js";

export default class AuthController {
  //Cadastro usuário
  static async registerUser(req, res) {
    const { name, username, email, password, confirmPassword } = req.body;

    const validationErrors = validateRegisterInput(
      name,
      username,
      email,
      password,
      confirmPassword
    );

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const usernameExists = await User.findOne({ username: username });

    if (usernameExists) {
      return res.status(422).json({ message: "Usuário existente" });
    }

    try {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = new User({
        name,
        username,
        email,
        password: passwordHash
      });

      await newUser.save();

      res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  //Login usuário
  static async loginUser(req, res) {
    const { username, password } = req.body;
    const validationErrors = validateLoginInput(username, password);

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const findUser = await User.findOne({ username: username });

    if (!findUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);

    if (!checkPassword) {
      return res.status(422).json({ message: "Usuário ou senha incorretos" });
    }

    try {
      const accessToken = jwt.sign(
        { sub: findUser._id },
        process.env.SECRET_JWT,
        { expiresIn: "15m" }
      );

      const refreshToken = crypto.randomBytes(64).toString("hex");

      await redisClient.set(
        refreshToken,
        findUser._id.toString(),
        "EX",
        604800
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: true, //Set to true when use https://
        sameSite: "strict",
        maxAge: 604800000
      });

      res.status(200).set("Authorization", accessToken).json({
        message: "Login efetuado com sucesso",
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Login não permitido" });
    }
  }

  //Logout usuário
  static async logoutUser(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      const accessToken = req.headers.authorization.split(" ")[1];

      redisClient.set(`blacklist: ${accessToken}`, "revoked");

      redisClient.del(refreshToken);

      res.json({ message: "Logout efetuado" });
    } catch (error) {}
  }

  //Renovação de token de sessão
  static async renewRefreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res
          .status(401)
          .json({ message: "Refresh Token não encontrado" });
      }
      const userId = await redisClient.get(refreshToken);

      if (!userId) {
        return res
          .status(401)
          .json({ message: "Invalid or expired Refresh Token" });
      }

      const accessToken = jwt.sign({ sub: userId }, process.env.SECRET_JWT, {
        expiresIn: "15m"
      });

      const newRefreshToken = crypto.randomBytes(64).toString("hex");

      await redisClient.set(newRefreshToken, userId, "EX", 604800);

      await redisClient.del(refreshToken);

      return res
        .status(201)
        .set("Authorization", accessToken)
        .cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          //secured: true //Set true when use https://
          sameSite: "strict",
          maxAge: 604800000
        })
        .json({
          accessToken,
          newRefreshToken
        });
    } catch {
      return res.status(401).json({ message: "Unable to refresh tokens." });
    }
  }
}

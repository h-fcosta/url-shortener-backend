import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  validateRegisterInput,
  validateLoginInput,
  hashData
} from "./middleware.js";
import TokensBlacklist from "../models/TokensBlacklist.js";

export default class AuthController {
  //Cadastro usuário
  static async registerUser(req, res) {
    const { name, username, email, password, confirmPassword } = req.body;

    const usernameExists = await User.findOne({ username: username });

    const validationErrors = validateRegisterInput(
      name,
      username,
      usernameExists,
      email,
      password,
      confirmPassword
    );

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    try {
      const passwordHash = await hashData(password);

      const newUser = new User({
        name,
        username,
        email,
        password: passwordHash
      });

      await newUser.save();

      res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  //Login usuário
  static async loginUser(req, res) {
    const { username, password } = req.body;

    const findUser = await User.findOne({ username: username });

    if (!findUser) {
      return res
        .status(400)
        .json({ errors: { username: "Usuário incorreto ou não encontrado" } });
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);

    const validationErrors = validateLoginInput(
      username,
      password,
      checkPassword
    );

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    try {
      const accessToken = jwt.sign(
        { sub: findUser._id, email: findUser.email },
        process.env.SECRET_JWT,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { sub: findUser._id, username: findUser.username },
        process.env.REFRESH_SECRET_JWT,
        { expiresIn: "7d" }
      );

      const refreshTokenHash = await hashData(refreshToken);

      await User.updateOne(
        { username: username },
        { refreshToken: refreshTokenHash }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, //Set to true when use https://
        sameSite: "strict",
        maxAge: 604800000
      });

      res.status(200).set("Authorization", accessToken).json({
        message: "Login efetuado com sucesso",
        name: findUser.name,
        accessToken,
        refreshTokenHash
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Login não permitido" });
    }
  }

  //Logout usuário
  static async logoutUser(req, res) {
    try {
      const accessToken = req.headers.authorization.split(" ")[1];

      const userId = jwt.verify(accessToken, process.env.SECRET_JWT);

      await TokensBlacklist.create({ revokedToken: accessToken });

      await User.findByIdAndUpdate({ _id: userId.sub }, { refreshToken: null });

      res.cookie("refreshToken", "", { maxAge: 0 });

      res.json({ message: "Logout efetuado" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao efetuar o logout" });
    }
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

      const userId = jwt.verify(refreshToken, process.env.REFRESH_SECRET_JWT);
      const storedToken = await User.findById({ _id: userId.sub });

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        storedToken.refreshToken
      );

      if (!refreshTokenMatches) {
        return res
          .status(401)
          .json({ message: "Invalid or expired Refresh Token" });
      }

      const accessToken = jwt.sign(
        { sub: storedToken._id, email: storedToken.email },
        process.env.SECRET_JWT,
        {
          expiresIn: "15m"
        }
      );

      const newRefreshToken = jwt.sign(
        { sub: storedToken._id, username: storedToken.username },
        process.env.REFRESH_SECRET_JWT,
        { expiresIn: "7d" }
      );

      const newRefreshTokenHash = await hashData(newRefreshToken);

      await User.findByIdAndUpdate(
        { _id: storedToken._id },
        { refreshToken: newRefreshTokenHash }
      );

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
          newRefreshTokenHash
        });
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Unable to refresh tokens." });
    }
  }
}

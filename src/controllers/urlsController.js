import jwt from "jsonwebtoken";
import Urls from "../models/Urls.js";
import User from "../models/User.js";

class urlsController {
  //Busca URLs
  static async getUrls(req, res) {
    try {
      const userId = jwt.verify(
        req.headers.authorization.split(" ")[1],
        process.env.SECRET_JWT
      );

      const listUrls = await Urls.find({ user: userId.sub });

      return res.status(200).json(listUrls);
    } catch (error) {
      res.status(500).json({ message: "Não foi possível listar as URLs" });
    }
  }

  //Envia URL para encurtar e cria referências entre os modelos (User e URL)
  static async originalUrl(req, res) {
    const { original_url } = req.body;

    const userId = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.SECRET_JWT
    );

    const newUrl = new Urls({
      original_url: original_url,
      user: userId.sub
    });

    if (!newUrl.original_url) {
      return res.status(422).json({ message: "URL obrigatória" });
    }

    try {
      await newUrl.save();

      const user = await User.findById(userId.sub);

      if (!user) {
        console.log("Usuário não encontrado");
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      user.urls.push(newUrl._id);

      await user.save();

      console.log(newUrl);

      return res.status(201).json({ message: "URL enviada com sucesso." });
    } catch (error) {
      return res.status(500).json({ message: "URL não pode ser enviada." });
    }
  }

  //Edita URL original
  static async editOriginalUrl(req, res) {
    try {
      const userId = jwt.verify(
        req.headers.authorization.split(" ")[1],
        process.env.SECRET_JWT
      );

      const shortUrl = req.params.shortUrl;

      const user = await User.findById(userId.sub, "-password");

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      await Urls.findOneAndUpdate(
        { short_url: shortUrl },
        { original_url: req.body.original_url }
      );

      await user.save();

      res.status(200).json({ message: "URL original alterada." });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "URL não pode ser alterada" });
    }
  }

  //Deleta URL do BD
  static async removeUrl(req, res) {
    const userId = jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.SECRET_JWT
    );

    const urlId = req.params.idUrl;

    try {
      const user = await User.findById(userId.sub, "-password");

      //Verifica se o usuário existe no banco de dados
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      //Verifica se a referência da URL existe no modelo do Usuário
      if (!user.urls.includes(urlId)) {
        return res
          .status(404)
          .json({ message: "URL do usuário não encontrada." });
      }

      //Apaga a referência da URL deletada, no array de URLs no modelo do Usuário
      await user.urls.pull(urlId);

      //Salva as alterações feitas no usuário
      await user.save();

      await Urls.findByIdAndRemove(urlId);

      return res.status(200).json({ message: "URL deletada" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Não foi possível deletar a URL." });
    }
  }

  //Procura e redireciona URL encurtada
  static async shortUrl(req, res) {
    const short = await Urls.findOne({ short_url: req.params.shortUrl });

    try {
      if (short == null) {
        return res.status(404).json({ message: "URL não existe" });
      }

      res.redirect(short.original_url);
    } catch (error) {
      console.log(error);
    }
  }
}

export default urlsController;

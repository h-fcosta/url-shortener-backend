import redisClient from "../config/redis.js";

//Autenticação de token do usuário
export async function authenticateToken(req, res, next) {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const searchToken = await redisClient.get(`blacklist: ${accessToken}`);

  if (searchToken) {
    return res.status(401).json({ message: "Access token invalid" });
  }

  next();
}

//Validação dos inputs do registro
export function validateRegisterInput(
  name,
  username,
  usernameExists,
  email,
  password,
  confirmPassword
) {
  const errors = {};

  if (!name || name.trim() === "") {
    errors.name = "Nome obrigatório";
  }

  if (usernameExists) {
    errors.username = "Usuário em uso";
  }

  if (!username || username.trim() === "") {
    errors.username = "Usuário obrigatório";
  }

  if (!email || email.trim() === "") {
    errors.email = "E-mail obrigatório";
  }

  if (!password || password.trim() === "") {
    errors.password = "Senha obrigatória";
  } else if (password.length < 8) {
    errors.password = "Senha deve ter no mínimo 8 caracteres";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Senha deve conter pelo menos uma letra minúscula";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Senha deve conter pelo menos uma letra maiúscula";
  } else if (!/\d/.test(password)) {
    errors.password = "Senha deve conter pelo menos um número";
  } else if (!/[!@#$%^&*]/.test(password)) {
    errors.password =
      "Senha deve conter pelo menos um dos seguintes caracteres: !@#$%^&*";
  }

  if (
    !confirmPassword ||
    confirmPassword.trim() === "" ||
    password !== confirmPassword
  ) {
    errors.password = "Senhas não conferem";
  }

  return errors;
}

//Validação dos inputs do login
export function validateLoginInput(username, password, checkPassword) {
  const errors = {};

  if (!checkPassword) {
    errors.password = "Senha incorreta";
  }

  if (!username || username.trim() === "") {
    errors.username = "Usuário obrigatório";
  }

  if (!password || password.trim() === "") {
    errors.password = "Senha obrigatória";
  }

  return errors;
}

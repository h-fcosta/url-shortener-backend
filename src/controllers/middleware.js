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
  email,
  password,
  confirmPassword
) {
  const errors = {};

  if (!name || name.trim() === "") {
    errors.name = "Nome obrigatório";
  }

  if (!username || username.trim() === "") {
    errors.username = "Usuário obrigatório";
  }

  if (!email || email.trim() === "") {
    errors.email = "E-mail obrigatório";
  }

  if (!password || password.trim() === "" || password.length < 5) {
    errors.password = "Senha deve ter no mínimo 5 caracteres";
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
export function validateLoginInput(username, password) {
  const errors = {};

  if (!username || username.trim() === "") {
    errors.username = "Usuário obrigatório";
  }

  if (!password || password.trim() === "") {
    errors.password = "Senha obrigatória";
  }

  return errors;
}

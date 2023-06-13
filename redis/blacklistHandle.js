import blacklist from "./blacklist.js";

function addToken(token) {
  blacklist.set(token, "");
}

async function hasToken(token) {
  const verify = await blacklist.exists(token);

  return verify === 1;
}

import crypto from "crypto";
import http from "http";
import fs from "fs";
import open from "open";
import fetch from "node-fetch";


const CLIENT_ID = "e9534eb9a3a110b3a89d07a15ac8aef7"; // 👉 à remplir
const REDIRECT_URI = "http://localhost:3085/callback";
const TOKEN_FILE = "./mal_token.json";

/**
 * Sauvegarde le token sur le disque
 */
function saveToken(tokenData: any) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
}

/**
 * Charge le token depuis le disque (si dispo)
 */
function loadToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
}

/**
 * Vérifie si le token actuel est encore valide
 */
function isTokenValid(tokenData: any): boolean {
  if (!tokenData?.created_at || !tokenData?.expires_in) return false;
  const expiresAt = tokenData.created_at + tokenData.expires_in * 1000;
  return Date.now() < expiresAt;
}

/**
 * Rafraîchit le token en utilisant le refresh_token
 */
async function refreshToken(oldToken: any) {
  console.log("🔄 Rafraîchissement du token...");
  const res = await fetch("https://myanimelist.net/v1/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: oldToken.refresh_token,
    }),
  });

  const newToken: any = await res.json();

  if (newToken.error) {
    console.error("❌ Erreur de rafraîchissement :", newToken);
    return null;
  }

  newToken.created_at = Date.now();
  saveToken(newToken);
  console.log("✅ Token rafraîchi !");
  return newToken;
}

/**
 * Lance le flow OAuth complet si aucun token valide
 */
async function authorize(): Promise<any> {
  const codeVerifier = crypto.randomBytes(64).toString("base64url");
  const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

  const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&code_challenge=${codeChallenge}&code_challenge_method=plain&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&state=request123`;

  console.log("🌐 Ouvre ton navigateur pour autoriser ton appli...");
  console.log(authUrl);
  await open(authUrl);

  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith("/callback")) return;

      const url = new URL(req.url, REDIRECT_URI);
      const code = url.searchParams.get("code");

      if (!code) {
        res.end("Erreur : pas de code reçu.");
        return;
      }

      res.end("✅ Code reçu ! Retourne dans la console.");
      server.close();

      // Échange du code contre un access_token
      const tokenRes = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: "authorization_code",
          code,
          code_verifier: codeVerifier,
        }),
      });

      const tokenData: any = await tokenRes.json();
      tokenData.created_at = Date.now();
      saveToken(tokenData);
      console.log("✅ Nouveau token obtenu !");
      resolve(tokenData);
    });

    server.listen(3000, () => {
      console.log("➡️ Serveur prêt sur http://localhost:3000");
    });
  });
}

/**
 * Fonction principale : retourne toujours un token valide
 */
export async function getMALToken(): Promise<string> {
  let tokenData = loadToken();

  if (tokenData) {
    if (isTokenValid(tokenData)) {
      console.log("🔐 Token actuel encore valide.");
      return tokenData.access_token;
    }
    const refreshed: any = await refreshToken(tokenData);
    if (refreshed) return refreshed.access_token;
  }

  // Sinon, relancer le flow OAuth complet
  tokenData = (await authorize()) as any;
  return tokenData.access_token;
}

// ---- Exemple d'utilisation ----
if (require.main === module) {
  (async () => {
    try {
      const token = await getMALToken();
      console.log("🎫 Ton Bearer token :", token);
    } catch (err) {
      console.error(err);
      process.exitCode = 1;
    }
  })();
}

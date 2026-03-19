"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
var dotenv = require("dotenv");
dotenv.config();
/**
 * Configuration centralisée de l'application
 */
exports.config = {

  // External APIs
  myAnimeList: {
    clientId: process.env.MAL_CLIENT_ID,
    clientSecret: process.env.MAL_CLIENT_SECRET,
  },

  // Scraping
  scraping: {
    timeout: 60000,
    retries: 3,
    delayBetweenRequests: 1000,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },

  // Sites
  sites: {
    animeSama: {
      baseUrl: process.env.ANIME_SAMA_BASE_URL || "",
      catalogueUrl: (process.env.ANIME_SAMA_BASE_URL || "https://anime-sama.to") + "/catalogue",
    },
    lelmanga: {
      baseUrl: "https://lelmanga.com",
    },
  },
};
/**
 * Validation de la configuration au démarrage (Supabase optionnel maintenant)
 */
function validateConfig() {
  // Supabase n'est plus requis si on utilise Prisma
  // Les variables MAL peuvent être optionnelles selon l'utilisation
  return;
}

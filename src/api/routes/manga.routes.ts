import { Router } from "express";
import { mangaController } from "../controllers/manga.controller";

const router = Router();

/**
 * Routes pour les mangas
 */

// Récupérer un manga par titre
router.get("/:title", (req, res) => mangaController.getMangaByTitle(req, res));

// Récupérer tous les mangas d'un site
router.get("/site/:site", (req, res) =>
  mangaController.getMangasBySite(req, res),
);

// Récupérer tous les mangas
router.get("/", (req, res) => mangaController.getAllMangas(res));

// Récupérer les scans d'un manga
router.get("/:title/scans/:chapterId", (req, res) =>
  mangaController.getMangaScans(req, res),
);

// Récupérer les chapitres d'un manga
router.get("/:title/chapters", (req, res) =>
  mangaController.getMangaChapter(req, res),
);

// Créer un manga
router.post("/", (req, res) => mangaController.createManga(req, res));

// Ajouter un scan à un manga
router.post("/:title/scans", (req, res) => mangaController.addScan(req, res));

export default router;

import { Router } from 'express'
import { scrapingController } from '../controllers/scraping.controller'

const router = Router()

/**
 * @swagger
 * /api/scraping/add-manga:
 *   post:
 *     summary: Ajouter un nouveau manga par scraping
 *     tags: [Scraping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - site
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL du manga à scraper
 *               site:
 *                 type: string
 *                 description: Site source, exemple ANIME_SAMA
 *     responses:
 *       201:
 *         description: Manga ajouté avec succès
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/add-manga', (req, res) => scrapingController.addManga(req, res))

/**
 * @swagger
 * /api/scraping/update-manga:
 *   post:
 *     summary: Mettre à jour un manga avec les nouveaux chapitres
 *     tags: [Scraping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titre du manga à mettre à jour
 *     responses:
 *       200:
 *         description: Manga mis à jour avec succès
 *       404:
 *         description: Manga non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/update-manga', (req, res) => scrapingController.updateManga(req, res))

/**
 * @swagger
 * /api/scraping/update-all:
 *   post:
 *     summary: Mettre à jour tous les mangas avec les nouveaux chapitres
 *     tags: [Scraping]
 *     responses:
 *       200:
 *         description: Mise à jour terminée
 *       500:
 *         description: Erreur serveur
 */
router.post('/update-all', (req, res) => scrapingController.updateAllMangas(req, res))

export default router


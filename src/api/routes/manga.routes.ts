import { Router } from 'express'
import { mangaController } from '../controllers/manga.controller'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Manga:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         thumbnails:
 *           type: string
 *         color:
 *           type: string
 *         site:
 *           type: string
 *         linkManga:
 *           type: string
 *         mean:
 *           type: number
 *         mediaType:
 *           type: string
 *         status:
 *           type: string
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         authors:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Scan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         scanId:
 *           type: string
 *         chapter:
 *           type: number
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         date:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/mangas/site/{site}:
 *   get:
 *     summary: Récupérer tous les mangas d'un site
 *     tags: [Mangas]
 *     parameters:
 *       - in: path
 *         name: site
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom du site, exemple AnimeSama
 *     responses:
 *       200:
 *         description: Liste des mangas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Manga'
 */
router.get('/site/:site', (req, res) => mangaController.getMangasBySite(req, res))

/**
 * @swagger
 * /api/mangas/{title}:
 *   get:
 *     summary: Récupérer un manga par titre
 *     tags: [Mangas]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Titre du manga
 *     responses:
 *       200:
 *         description: Détails du manga
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manga'
 *       404:
 *         description: Manga non trouvé
 */
router.get('/:title', (req, res) => mangaController.getMangaByTitle(req, res))

/**
 * @swagger
 * /api/mangas/{title}/scans:
 *   get:
 *     summary: Récupérer les scans d'un manga
 *     tags: [Mangas]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Titre du manga
 *     responses:
 *       200:
 *         description: Liste des scans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Scan'
 */
router.get('/:title/scans', (req, res) => mangaController.getMangaScans(req, res))

/**
 * @swagger
 * /api/mangas:
 *   post:
 *     summary: Créer un nouveau manga
 *     tags: [Mangas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - thumbnails
 *               - site
 *               - linkManga
 *               - mediaType
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnails:
 *                 type: string
 *               color:
 *                 type: string
 *               site:
 *                 type: string
 *               linkManga:
 *                 type: string
 *               mean:
 *                 type: number
 *               mediaType:
 *                 type: string
 *               status:
 *                 type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Manga créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manga'
 */
router.post('/', (req, res) => mangaController.createManga(req, res))

/**
 * @swagger
 * /api/mangas/{title}/scans:
 *   post:
 *     summary: Ajouter un scan à un manga
 *     tags: [Mangas]
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: Titre du manga
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chapter
 *               - title
 *               - images
 *             properties:
 *               chapter:
 *                 type: number
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Scan ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scan'
 */
router.post('/:title/scans', (req, res) => mangaController.addScan(req, res))

export default router


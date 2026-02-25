import { Router } from 'express'
import { scrapingController } from '../controllers/scraping.controller'

const router = Router()

/**
 * Routes pour le scraping
 */

// Ajouter un nouveau manga par scraping
router.post('/add-manga', (req, res) => scrapingController.addManga(req, res))

// Mettre à jour un manga avec les nouveaux chapitres
router.post('/update-manga', (req, res) => scrapingController.updateManga(req, res))

// Mettre à jour tous les mangas
router.post('/update-all', (req, res) => scrapingController.updateAllMangas(req, res))

export default router

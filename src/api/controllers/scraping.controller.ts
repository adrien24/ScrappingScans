import { Request, Response } from 'express'
import { scrapingService } from '../../modules/scraping/services'
import { Logger } from '../../shared/utils'

const logger = new Logger('ScrapingController')

/**
 * Controller pour les endpoints de scraping
 */
export class ScrapingController {
    /**
     * POST /api/scraping/add-manga
     * Ajouter un nouveau manga en le scrapant
     */
    async addManga(req: Request, res: Response): Promise<void> {
        try {
            const { url, site } = req.body

            if (!url) {
                res.status(400).json({ error: 'Missing required field: url' })
                return
            }

            // Pour l'instant, on ne supporte que AnimeSama
            if (site && site !== 'ANIME_SAMA') {
                res.status(400).json({ error: 'Only ANIME_SAMA site is supported' })
                return
            }

            // Lancer le scraping en arrière-plan
            scrapingService
                .addMangaFromAnimeSama(url)
                .then(() => {
                    logger.success('Manga added successfully')
                })
                .catch((error) => {
                    logger.error('Failed to add manga', error)
                })

            res.status(202).json({
                message: 'Manga scraping started',
                url,
            })
        } catch (error) {
            logger.error('Error adding manga', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    /**
     * POST /api/scraping/update-manga
     * Mettre à jour un manga avec les nouveaux chapitres
     */
    async updateManga(req: Request, res: Response): Promise<void> {
        try {
            const { title, url } = req.body

            if (!title || !url) {
                res.status(400).json({ error: 'Missing required fields: title, url' })
                return
            }

            // Lancer la mise à jour en arrière-plan
            scrapingService
                .updateMangaFromAnimeSama(title, url)
                .then(() => {
                    logger.success('Manga updated successfully')
                })
                .catch((error) => {
                    logger.error('Failed to update manga', error)
                })

            res.status(202).json({
                message: 'Manga update started',
                title,
            })
        } catch (error) {
            logger.error('Error updating manga', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    /**
     * POST /api/scraping/update-all
     * Mettre à jour tous les mangas AnimeSama
     */
    async updateAllMangas(req: Request, res: Response): Promise<void> {
        try {
            // Lancer la mise à jour en arrière-plan
            scrapingService
                .updateAllAnimeSamaMangas()
                .then(() => {
                    logger.success('All mangas updated successfully')
                })
                .catch((error) => {
                    logger.error('Failed to update all mangas', error)
                })

            res.status(202).json({
                message: 'Update started for all AnimeSama mangas',
            })
        } catch (error) {
            logger.error('Error updating all mangas', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

export const scrapingController = new ScrapingController()

import { Request, Response } from 'express'
import { mangaService } from '../../modules/manga/services'
import { Logger } from '../../shared/utils'

const logger = new Logger('MangaController')

/**
 * Controller pour les endpoints manga
 */
export class MangaController {
    /**
     * GET /api/mangas/:title
     * Récupérer un manga par son titre
     */
    async getMangaByTitle(req: Request, res: Response): Promise<void> {
        try {
            const { title } = req.params
            const manga = await mangaService.getMangaByTitle(title)

            if (!manga) {
                res.status(404).json({ error: 'Manga not found' })
                return
            }

            res.json(manga)
        } catch (error) {
            logger.error('Error getting manga by title', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    /**
     * GET /api/mangas/site/:site
     * Récupérer tous les mangas d'un site
     */
    async getMangasBySite(req: Request, res: Response): Promise<void> {
        try {
            const { site } = req.params
            const mangas = await mangaService.getMangasBySite(site as any)

            res.json({
                count: mangas.length,
                data: mangas,
            })
        } catch (error) {
            logger.error('Error getting mangas by site', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    /**
     * GET /api/mangas/:title/scans
     * Récupérer tous les scans d'un manga
     */
    async getMangaScans(req: Request, res: Response): Promise<void> {
        try {
            const { title } = req.params

            // Récupérer le manga pour obtenir son ID
            const manga = await mangaService.getMangaByTitle(title)
            if (!manga) {
                res.status(404).json({ error: 'Manga not found' })
                return
            }

            const scans = await mangaService.getMangaScans(manga.id!)

            res.json({
                manga: title,
                count: scans.length,
                scans,
            })
        } catch (error) {
            logger.error('Error getting manga scans', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    /**
     * POST /api/mangas
     * Créer un manga manuellement
     */
    async createManga(req: Request, res: Response): Promise<void> {
        try {
            const { title, linkManga, site } = req.body

            if (!title || !linkManga || !site) {
                res.status(400).json({ error: 'Missing required fields: title, linkManga, site' })
                return
            }

            const manga = await mangaService.createMangaFromMAL(title, linkManga, site)

            res.status(201).json({
                message: 'Manga created successfully',
                manga,
            })
        } catch (error) {
            logger.error('Error creating manga', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    /**
     * POST /api/mangas/:title/scans
     * Ajouter un scan à un manga
     */
    async addScan(req: Request, res: Response): Promise<void> {
        try {
            const { title } = req.params
            const scanData = req.body

            if (!scanData.chapter || !scanData.title || !scanData.images) {
                res.status(400).json({ error: 'Missing required fields: chapter, title, images' })
                return
            }

            // Récupérer le manga pour obtenir son ID
            const manga = await mangaService.getMangaByTitle(title)
            if (!manga) {
                res.status(404).json({ error: 'Manga not found' })
                return
            }

            const scan = await mangaService.addScan(manga.id!, {
                ...scanData,
                scanId: manga.id!,
            })

            res.status(201).json({
                message: 'Scan added successfully',
                scan,
            })
        } catch (error) {
            logger.error('Error adding scan', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}

export const mangaController = new MangaController()

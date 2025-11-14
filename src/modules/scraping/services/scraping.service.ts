import { animeSamaScraper } from '../scrapers/animeSama.scraper'
import { mangaService } from '../../manga/services'
import { SiteSource, ScrapedChapter, CreateScanDTO } from '../../../shared/types'
import { Logger } from '../../../shared/utils'

const logger = new Logger('ScrapingService')

/**
 * Service orchestrant le scraping et l'ajout de mangas
 */
export class ScrapingService {
    private static instance: ScrapingService

    private constructor() { }

    public static getInstance(): ScrapingService {
        if (!ScrapingService.instance) {
            ScrapingService.instance = new ScrapingService()
        }
        return ScrapingService.instance
    }

    /**
     * Ajouter un nouveau manga depuis AnimeSama
     */
    async addMangaFromAnimeSama(mangaUrl: string): Promise<void> {
        logger.info(`Adding manga from AnimeSama: ${mangaUrl}`)

        try {
            // 1. Scraper tous les chapitres
            const chapters = await animeSamaScraper.scrapeChapters(mangaUrl)

            if (chapters.length === 0) {
                throw new Error('No chapters found')
            }

            const mangaTitle = chapters[0].scanId

            // 2. S'assurer que le manga existe (créer si nécessaire depuis MAL)
            await mangaService.ensureMangaExists(mangaTitle, mangaUrl, SiteSource.ANIME_SAMA)

            // 3. Trier les chapitres par numéro
            const sortedChapters = chapters.sort((a, b) => {
                const chA = a.chapter || 0
                const chB = b.chapter || 0
                return chA - chB
            })

            // 4. Scraper et ajouter chaque chapitre
            for (const chapter of sortedChapters) {
                try {
                    logger.info(`Processing chapter ${chapter.chapter}: ${chapter.title}`)

                    // Scraper les images du chapitre
                    const images = await animeSamaScraper.scrapeChapterImages(chapter.title, mangaUrl)

                    // Créer le scan
                    const scanData: CreateScanDTO = {
                        scanId: mangaTitle,
                        chapter: chapter.chapter,
                        title: chapter.title,
                        description: '',
                        images,
                    }

                    await mangaService.addScan(mangaTitle, scanData)
                } catch (error) {
                    logger.error(`Failed to process chapter ${chapter.chapter}`, error)
                    // Continue avec le chapitre suivant
                    continue
                }
            }

            logger.success(`✅ Manga added successfully: ${mangaTitle}`)
        } catch (error) {
            logger.error('Failed to add manga', error)
            throw error
        }
    }

    /**
     * Mettre à jour un manga existant avec les nouveaux chapitres
     */
    async updateMangaFromAnimeSama(mangaTitle: string, mangaUrl: string): Promise<void> {
        logger.info(`Updating manga: ${mangaTitle}`)

        try {
            // 1. Scraper tous les chapitres disponibles
            const scrapedChapters = await animeSamaScraper.scrapeChapters(mangaUrl)

            // 2. Trouver les nouveaux chapitres
            const newChapterNumbers = await mangaService.findNewChapters(mangaTitle, scrapedChapters)

            if (newChapterNumbers.length === 0) {
                logger.info(`✓ No new chapters for ${mangaTitle}`)
                return
            }

            logger.info(`📚 Found ${newChapterNumbers.length} new chapter(s)`)

            // 3. Filtrer les chapitres scrapés pour ne garder que les nouveaux
            const newChapters = scrapedChapters.filter((ch) =>
                newChapterNumbers.includes(ch.chapter as number),
            )

            // 4. Ajouter les nouveaux chapitres
            for (const chapter of newChapters) {
                try {
                    logger.info(`  → Processing chapter ${chapter.chapter}: ${chapter.title}`)

                    const images = await animeSamaScraper.scrapeChapterImages(chapter.title, mangaUrl)

                    const scanData: CreateScanDTO = {
                        scanId: mangaTitle,
                        chapter: chapter.chapter,
                        title: chapter.title,
                        description: '',
                        images,
                    }

                    await mangaService.addScan(mangaTitle, scanData)
                } catch (error) {
                    logger.error(`Failed to process chapter ${chapter.chapter}`, error)
                    continue
                }
            }

            logger.success(`✅ Manga updated: ${mangaTitle}`)
        } catch (error) {
            logger.error(`Failed to update manga: ${mangaTitle}`, error)
            throw error
        }
    }

    /**
     * Mettre à jour tous les mangas d'AnimeSama
     */
    async updateAllAnimeSamaMangas(): Promise<void> {
        logger.info('Updating all AnimeSama mangas...')

        try {
            const mangas = await mangaService.getMangasBySite(SiteSource.ANIME_SAMA)

            logger.info(`Found ${mangas.length} mangas to update`)

            for (const manga of mangas) {
                try {
                    await this.updateMangaFromAnimeSama(manga.title, manga.linkManga)
                } catch (error) {
                    logger.error(`Failed to update ${manga.title}`, error)
                    // Continue avec le manga suivant
                    continue
                }
            }

            logger.success('✅ All mangas updated')
        } catch (error) {
            logger.error('Failed to update all mangas', error)
            throw error
        }
    }
}

export const scrapingService = ScrapingService.getInstance()

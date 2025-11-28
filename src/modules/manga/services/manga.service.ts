import { mangaRepositoryPrisma as mangaRepository } from '../repositories/manga.repository.prisma'
import { scanRepositoryPrisma as scanRepository } from '../repositories/scan.repository.prisma'
import { malClient } from '../../../core/external-apis'
import {
    Manga,
    Scan,
    MangaWithScans,
    SiteSource,
    CreateScanDTO,
    MALMangaSearchResponse,
    MediaType,
    MangaStatus,
} from '../../../shared/types'
import { Logger, formatDateISO } from '../../../shared/utils'
import { translate } from '@vitalets/google-translate-api'

const logger = new Logger('MangaService')

/**
 * Service pour gérer la logique métier des mangas
 */
export class MangaService {
    private static instance: MangaService

    private constructor() { }

    public static getInstance(): MangaService {
        if (!MangaService.instance) {
            MangaService.instance = new MangaService()
        }
        return MangaService.instance
    }

    /**
     * Obtenir un manga par titre
     */
    async getMangaByTitle(title: string): Promise<Manga | null> {
        return mangaRepository.findByTitle(title)
    }

    /**
     * Obtenir tous les mangas d'un site avec leurs scans
     */
    async getMangasBySite(site: SiteSource): Promise<MangaWithScans[]> {
        return mangaRepository.findBySite(site)
    }

    /**
     * Vérifier si un manga existe
     */
    async mangaExists(title: string): Promise<boolean> {
        return mangaRepository.exists(title)
    }

    /**
     * Créer un manga depuis les données MAL
     */
    async createMangaFromMAL(
        title: string,
        linkManga: string,
        site: SiteSource,
    ): Promise<Manga> {
        logger.info(`Creating manga from MAL: ${title}`)

        // Récupérer les données depuis MAL
        const malData = await malClient.findMangaByTitle(title)

        // Traduire la description
        let description = malData.synopsis.split('[Written by MAL Rewrite]')[0]
        try {
            const translation = await translate(description, { from: 'en', to: 'fr' })
            description = translation.text
        } catch (error) {
            logger.warn('Translation failed, using original description')
        }

        // Mapper les auteurs
        const authors = malData.authors.map((author) => ({
            node: {
                id: author.node.id,
                firstName: author.node.first_name,
                lastName: author.node.last_name,
            },
            role: author.role,
        }))

        // Créer le manga
        const manga: Partial<Manga> = {
            title,
            description,
            thumbnails: malData.main_picture.large,
            color: null,
            createdAt: malData['start-date'],
            updatedAt: formatDateISO(),
            site,
            linkManga,
            mean: malData.mean,
            mediaType: this.mapMediaType(malData.media_type),
            status: this.mapStatus(malData.status),
            genres: malData.genres,
            authors,
        }

        return mangaRepository.create(manga)
    }

    /**
     * Créer ou récupérer un manga
     */
    async ensureMangaExists(
        title: string,
        linkManga: string,
        site: SiteSource,
    ): Promise<Manga> {
        const existing = await this.getMangaByTitle(title)
        if (existing) {
            logger.info(`Manga already exists: ${title}`)
            return existing
        }

        logger.info(`Manga not found, creating from MAL: ${title}`)
        return this.createMangaFromMAL(title, linkManga, site)
    }

    /**
     * Ajouter un scan à un manga
     */
    async addScan(mangaId: string, scanData: CreateScanDTO): Promise<Scan> {
        logger.info(`Adding scan: Chapter ${scanData.chapter} - ${scanData.title}`)

        const scan: Partial<Scan> = {
            scanId: mangaId,
            chapter: scanData.chapter,
            title: scanData.title,
            description: scanData.description || '',
            images: scanData.images,
            date: scanData.date || formatDateISO(),
        }

        return scanRepository.create(scan)
    }

    /**
     * Obtenir les scans d'un manga
     */
    async getMangaScans(mangaId: string): Promise<Scan[]> {
        return scanRepository.findByMangaId(mangaId)
    }

    /**
     * Trouver les nouveaux chapitres à ajouter
     */
    async findNewChapters(
        mangaId: string,
        scrapedChapters: Array<{ chapter: number | null }>,
    ): Promise<number[]> {
        const existingScans = await this.getMangaScans(mangaId)
        const existingChapters = existingScans.map((scan) => scan.chapter).filter((ch) => ch !== null)

        const newChapters = scrapedChapters
            .map((ch) => ch.chapter)
            .filter((ch) => ch !== null && !existingChapters.includes(ch)) as number[]

        return newChapters
    }

    /**
     * Mapper le type de média MAL vers notre enum
     */
    private mapMediaType(malType: string): MediaType {
        const typeMap: Record<string, MediaType> = {
            manga: MediaType.MANGA,
            manhwa: MediaType.MANHWA,
            manhua: MediaType.MANHUA,
            light_novel: MediaType.LIGHT_NOVEL,
            novel: MediaType.LIGHT_NOVEL,
        }

        return typeMap[malType.toLowerCase()] || MediaType.MANGA
    }

    /**
     * Mapper le statut MAL vers notre enum
     */
    private mapStatus(malStatus: string): MangaStatus {
        const statusMap: Record<string, MangaStatus> = {
            publishing: MangaStatus.ONGOING,
            finished: MangaStatus.COMPLETED,
            on_hiatus: MangaStatus.HIATUS,
            discontinued: MangaStatus.CANCELLED,
        }

        return statusMap[malStatus.toLowerCase()] || MangaStatus.ONGOING
    }
}

export const mangaService = MangaService.getInstance()

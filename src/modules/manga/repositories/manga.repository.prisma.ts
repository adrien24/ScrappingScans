import { prisma } from '../../../core/database/prisma.client'
import { IMangaRepository } from '../domain/manga.repository.interface'
import { Manga, MangaWithScans, SiteSource } from '../../../shared/types'
import { Logger } from '../../../shared/utils'
import { Prisma } from '@prisma/client'

const logger = new Logger('MangaRepositoryPrisma')

/**
 * Implémentation du repository pour les mangas avec Prisma
 */
export class MangaRepositoryPrisma implements IMangaRepository {
    private static instance: MangaRepositoryPrisma

    private constructor() { }

    public static getInstance(): MangaRepositoryPrisma {
        if (!MangaRepositoryPrisma.instance) {
            MangaRepositoryPrisma.instance = new MangaRepositoryPrisma()
        }
        return MangaRepositoryPrisma.instance
    }

    async findByTitle(title: string): Promise<Manga | null> {
        try {
            const manga = await prisma.manga.findUnique({
                where: { title },
            })

            if (!manga) return null

            return this.mapToManga(manga)
        } catch (error) {
            logger.error(`Error finding manga by title: ${title}`, error)
            throw error
        }
    }

    async findBySite(site: SiteSource): Promise<MangaWithScans[]> {
        try {
            const mangas = await prisma.manga.findMany({
                where: { site },
                include: {
                    scans: {
                        orderBy: { chapter: 'asc' },
                    },
                },
            })

            return mangas.map((manga: Prisma.MangaGetPayload<{ include: { scans: true } }>) => this.mapToMangaWithScans(manga))
        } catch (error) {
            logger.error(`Error finding mangas by site: ${site}`, error)
            throw error
        }
    }

    async create(manga: Partial<Manga>): Promise<Manga> {
        try {
            const created = await prisma.manga.create({
                data: {
                    title: manga.title!,
                    description: manga.description!,
                    thumbnails: manga.thumbnails!,
                    color: manga.color || null,
                    site: manga.site!,
                    linkManga: manga.linkManga!,
                    mean: manga.mean || 0,
                    mediaType: manga.mediaType!,
                    status: manga.status!,
                    genres: (manga.genres || []) as any,
                    authors: (manga.authors || []) as any,
                },
            })

            logger.success(`Manga created: ${manga.title}`)
            return this.mapToManga(created)
        } catch (error) {
            logger.error(`Error creating manga: ${manga.title}`, error)
            throw error
        }
    }

    async update(title: string, data: Partial<Manga>): Promise<Manga> {
        try {
            const updated = await prisma.manga.update({
                where: { title },
                data: {
                    ...(data.description && { description: data.description }),
                    ...(data.thumbnails && { thumbnails: data.thumbnails }),
                    ...(data.color !== undefined && { color: data.color }),
                    ...(data.mean !== undefined && { mean: data.mean }),
                    ...(data.status && { status: data.status }),
                    ...(data.genres && { genres: data.genres as any }),
                    ...(data.authors && { authors: data.authors as any }),
                },
            })

            logger.success(`Manga updated: ${title}`)
            return this.mapToManga(updated)
        } catch (error) {
            logger.error(`Error updating manga: ${title}`, error)
            throw error
        }
    }

    async exists(title: string): Promise<boolean> {
        try {
            const count = await prisma.manga.count({
                where: { title },
            })
            return count > 0
        } catch (error) {
            logger.error(`Error checking manga existence: ${title}`, error)
            return false
        }
    }

    /**
     * Mapper les données Prisma vers l'entité Manga
     */
    private mapToManga(data: Prisma.MangaGetPayload<{}>): Manga {
        return {
            id: data.id,
            title: data.title,
            description: data.description,
            thumbnails: data.thumbnails,
            color: data.color,
            createdAt: data.createdAt.toISOString(),
            updatedAt: data.updatedAt.toISOString(),
            site: data.site as SiteSource,
            linkManga: data.linkManga,
            mean: data.mean,
            mediaType: data.mediaType,
            status: data.status,
            genres: Array.isArray(data.genres) ? data.genres : JSON.parse(data.genres || '[]'),
            authors: Array.isArray(data.authors) ? data.authors : JSON.parse(data.authors || '[]'),
        }
    }

    /**
     * Mapper les données Prisma vers MangaWithScans
     */
    private mapToMangaWithScans(data: Prisma.MangaGetPayload<{ include: { scans: true } }>): MangaWithScans {
        return {
            ...this.mapToManga(data),
            scans: data.scans?.map((scan: Prisma.ScanGetPayload<{}>) => ({
                id: scan.id,
                scanId: scan.scanId,
                chapter: scan.chapter,
                title: scan.title,
                description: scan.description,
                images: Array.isArray(scan.images) ? scan.images : JSON.parse(scan.images || '[]'),
                date: scan.date,
                createdAt: scan.createdAt.toISOString(),
            })) || [],
        }
    }
}

export const mangaRepositoryPrisma = MangaRepositoryPrisma.getInstance()

import { prisma } from '../../../core/database/prisma.client'
import { IScanRepository } from '../domain/manga.repository.interface'
import { Scan } from '../../../shared/types'
import { Logger } from '../../../shared/utils'
import { Prisma } from '@prisma/client'

const logger = new Logger('ScanRepositoryPrisma')

/**
 * Implémentation du repository pour les scans avec Prisma
 */
export class ScanRepositoryPrisma implements IScanRepository {
    private static instance: ScanRepositoryPrisma

    private constructor() { }

    public static getInstance(): ScanRepositoryPrisma {
        if (!ScanRepositoryPrisma.instance) {
            ScanRepositoryPrisma.instance = new ScanRepositoryPrisma()
        }
        return ScanRepositoryPrisma.instance
    }

    async findByMangaId(mangaId: string): Promise<Scan[]> {
        try {
            const scans = await prisma.scan.findMany({
                where: { scanId: mangaId },
                orderBy: { chapter: 'asc' },
            })

            return scans.map((scan: Prisma.ScanGetPayload<{}>) => this.mapToScan(scan))
        } catch (error) {
            logger.error(`Error finding scans for manga: ${mangaId}`, error)
            throw error
        }
    }

    async create(scan: Partial<Scan>): Promise<Scan> {
        try {
            const created = await prisma.scan.create({
                data: {
                    scanId: scan.scanId!,
                    chapter: scan.chapter || null,
                    title: scan.title!,
                    description: scan.description || '',
                    images: (scan.images || []) as any,
                    date: scan.date || '',
                },
            })

            logger.success(`Scan created: Chapter ${scan.chapter} - ${scan.title}`)
            return this.mapToScan(created)
        } catch (error) {
            logger.error(`Error creating scan: ${scan.title}`, error)
            throw error
        }
    }

    async findByChapter(mangaId: string, chapter: number): Promise<Scan | null> {
        try {
            const scan = await prisma.scan.findFirst({
                where: {
                    scanId: mangaId,
                    chapter,
                },
            })

            return scan ? this.mapToScan(scan) : null
        } catch (error) {
            logger.error(`Error finding scan by chapter: ${mangaId} - ${chapter}`, error)
            throw error
        }
    }

    /**
     * Mapper les données Prisma vers l'entité Scan
     */
    private mapToScan(data: Prisma.ScanGetPayload<{}>): Scan {
        return {
            id: data.id,
            scanId: data.scanId,
            chapter: data.chapter,
            title: data.title,
            description: data.description,
            images: Array.isArray(data.images) ? data.images : JSON.parse(data.images || '[]'),
            date: data.date,
            createdAt: data.createdAt.toISOString(),
        }
    }
}

export const scanRepositoryPrisma = ScanRepositoryPrisma.getInstance()

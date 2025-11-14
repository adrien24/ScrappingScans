import { supabase } from '../../../core/database'
import { IScanRepository } from '../domain/manga.repository.interface'
import { Scan } from '../../../shared/types'
import { Logger } from '../../../shared/utils'

const logger = new Logger('ScanRepository')

/**
 * Implémentation du repository pour les scans avec Supabase
 */
export class ScanRepository implements IScanRepository {
    private static instance: ScanRepository

    private constructor() { }

    public static getInstance(): ScanRepository {
        if (!ScanRepository.instance) {
            ScanRepository.instance = new ScanRepository()
        }
        return ScanRepository.instance
    }

    async findByMangaId(mangaId: string): Promise<Scan[]> {
        try {
            const { data, error } = await supabase
                .from('Scans')
                .select('*')
                .eq('scan_id', mangaId)
                .order('chapter', { ascending: true })

            if (error) throw error

            return data.map((scan) => this.mapToScan(scan))
        } catch (error) {
            logger.error(`Error finding scans for manga: ${mangaId}`, error)
            throw error
        }
    }

    async create(scan: Partial<Scan>): Promise<Scan> {
        try {
            const insertData = this.mapToDatabase(scan)

            const { data, error } = await supabase
                .from('Scans')
                .insert(insertData)
                .select()
                .single()

            if (error) throw error

            logger.success(`Scan created: Chapter ${scan.chapter} - ${scan.title}`)
            return this.mapToScan(data)
        } catch (error) {
            logger.error(`Error creating scan: ${scan.title}`, error)
            throw error
        }
    }

    async findByChapter(mangaId: string, chapter: number): Promise<Scan | null> {
        try {
            const { data, error } = await supabase
                .from('Scans')
                .select('*')
                .eq('scan_id', mangaId)
                .eq('chapter', chapter)
                .maybeSingle()

            if (error) throw error

            return data ? this.mapToScan(data) : null
        } catch (error) {
            logger.error(`Error finding scan by chapter: ${mangaId} - ${chapter}`, error)
            throw error
        }
    }

    /**
     * Mapper les données de la base vers l'entité Scan
     */
    private mapToScan(data: any): Scan {
        return {
            id: data.id,
            scanId: data.scan_id,
            chapter: data.chapter,
            title: data.title,
            description: data.description || '',
            images: data.images || [],
            date: data.date || '',
            createdAt: data.created_at,
        }
    }

    /**
     * Mapper l'entité Scan vers les données de la base
     */
    private mapToDatabase(scan: Partial<Scan>): any {
        return {
            scan_id: scan.scanId,
            chapter: scan.chapter,
            title: scan.title,
            description: scan.description || '',
            images: scan.images || [],
            date: scan.date || '',
        }
    }
}

export const scanRepository = ScanRepository.getInstance()

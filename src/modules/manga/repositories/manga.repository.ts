import { supabase } from '../../../core/database'
import { IMangaRepository } from '../domain/manga.repository.interface'
import { Manga, MangaWithScans, SiteSource } from '../../../shared/types'
import { Logger } from '../../../shared/utils'

const logger = new Logger('MangaRepository')

/**
 * Implémentation du repository pour les mangas avec Supabase
 */
export class MangaRepository implements IMangaRepository {
    private static instance: MangaRepository

    private constructor() { }

    public static getInstance(): MangaRepository {
        if (!MangaRepository.instance) {
            MangaRepository.instance = new MangaRepository()
        }
        return MangaRepository.instance
    }

    async findByTitle(title: string): Promise<Manga | null> {
        try {
            const { data, error } = await supabase
                .from('Mangas')
                .select('*')
                .eq('title', title)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null
                }
                throw error
            }

            return this.mapToManga(data)
        } catch (error) {
            logger.error(`Error finding manga by title: ${title}`, error)
            throw error
        }
    }

    async findBySite(site: SiteSource): Promise<MangaWithScans[]> {
        try {
            const { data, error } = await supabase
                .from('Mangas')
                .select('*, Scans(chapter)')
                .eq('site', site)

            if (error) throw error

            return data.map((manga) => this.mapToMangaWithScans(manga))
        } catch (error) {
            logger.error(`Error finding mangas by site: ${site}`, error)
            throw error
        }
    }

    async create(manga: Partial<Manga>): Promise<Manga> {
        try {
            const insertData = this.mapToDatabase(manga)

            const { data, error } = await supabase
                .from('Mangas')
                .insert(insertData)
                .select()
                .single()

            if (error) throw error

            logger.success(`Manga created: ${manga.title}`)
            return this.mapToManga(data)
        } catch (error) {
            logger.error(`Error creating manga: ${manga.title}`, error)
            throw error
        }
    }

    async update(title: string, data: Partial<Manga>): Promise<Manga> {
        try {
            const updateData = this.mapToDatabase(data)

            const { data: updated, error } = await supabase
                .from('Mangas')
                .update(updateData)
                .eq('title', title)
                .select()
                .single()

            if (error) throw error

            logger.success(`Manga updated: ${title}`)
            return this.mapToManga(updated)
        } catch (error) {
            logger.error(`Error updating manga: ${title}`, error)
            throw error
        }
    }

    async exists(title: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('Mangas')
                .select('title')
                .eq('title', title)
                .maybeSingle()

            if (error) throw error

            return data !== null
        } catch (error) {
            logger.error(`Error checking manga existence: ${title}`, error)
            return false
        }
    }

    /**
     * Mapper les données de la base vers l'entité Manga
     */
    private mapToManga(data: any): Manga {
        return {
            id: data.id,
            title: data.title,
            description: data.description,
            thumbnails: data.thumbnails,
            color: data.color,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            site: data.site as SiteSource,
            linkManga: data.linkManga,
            mean: data.mean,
            mediaType: data.media_type,
            status: data.status,
            genres: data.genres || [],
            authors: data.authors || [],
        }
    }

    /**
     * Mapper les données de la base vers MangaWithScans
     */
    private mapToMangaWithScans(data: any): MangaWithScans {
        return {
            ...this.mapToManga(data),
            scans: data.Scans || [],
        }
    }

    /**
     * Mapper l'entité Manga vers les données de la base
     */
    private mapToDatabase(manga: Partial<Manga>): any {
        const dbData: any = {}

        if (manga.title) dbData.title = manga.title
        if (manga.description) dbData.description = manga.description
        if (manga.thumbnails) dbData.thumbnails = manga.thumbnails
        if (manga.color !== undefined) dbData.color = manga.color
        if (manga.createdAt) dbData.created_at = manga.createdAt
        if (manga.updatedAt) dbData.updated_at = manga.updatedAt
        if (manga.site) dbData.site = manga.site
        if (manga.linkManga) dbData.linkManga = manga.linkManga
        if (manga.mean) dbData.mean = manga.mean
        if (manga.mediaType) dbData.media_type = manga.mediaType
        if (manga.status) dbData.status = manga.status
        if (manga.genres) dbData.genres = manga.genres
        if (manga.authors) dbData.authors = manga.authors

        return dbData
    }
}

export const mangaRepository = MangaRepository.getInstance()

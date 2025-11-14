import { Manga, Scan, MangaWithScans, SiteSource } from '../../../shared/types'

/**
 * Repository interface pour les mangas
 * Définit le contrat pour l'accès aux données
 */
export interface IMangaRepository {
    /**
     * Trouver un manga par son titre
     */
    findByTitle(title: string): Promise<Manga | null>

    /**
     * Trouver tous les mangas d'un site
     */
    findBySite(site: SiteSource): Promise<MangaWithScans[]>

    /**
     * Créer un nouveau manga
     */
    create(manga: Partial<Manga>): Promise<Manga>

    /**
     * Mettre à jour un manga
     */
    update(title: string, data: Partial<Manga>): Promise<Manga>

    /**
     * Vérifier si un manga existe
     */
    exists(title: string): Promise<boolean>
}

/**
 * Repository interface pour les scans
 */
export interface IScanRepository {
    /**
     * Trouver tous les scans d'un manga
     */
    findByMangaId(mangaId: string): Promise<Scan[]>

    /**
     * Créer un nouveau scan
     */
    create(scan: Partial<Scan>): Promise<Scan>

    /**
     * Trouver un scan par chapitre
     */
    findByChapter(mangaId: string, chapter: number): Promise<Scan | null>
}

import { SiteSource, MangaStatus, MediaType } from './common.types'

/**
 * Entité Manga - Représentation du domaine
 */
export interface Manga {
    id?: string
    title: string
    description: string
    thumbnails: string
    color: string | null
    createdAt: string
    updatedAt: string
    site: SiteSource
    linkManga: string
    mean: number
    mediaType: MediaType
    status: MangaStatus
    genres: Genre[]
    authors: Author[]
}

/**
 * Genre d'un manga
 */
export interface Genre {
    id: number
    name: string
}

/**
 * Auteur d'un manga
 */
export interface Author {
    node: {
        id: number
        firstName: string
        lastName: string
    }
    role: string
}

/**
 * DTO pour créer un manga
 */
export interface CreateMangaDTO {
    title: string
    description: string
    thumbnails: string
    color?: string | null
    createdAt: string
    site: SiteSource
    linkManga: string
    mean: number
    mediaType: MediaType
    status: MangaStatus
    genres: Genre[]
    authors: Author[]
}

/**
 * DTO pour mettre à jour un manga
 */
export interface UpdateMangaDTO {
    description?: string
    thumbnails?: string
    updatedAt: string
    mean?: number
    status?: MangaStatus
}

/**
 * Manga avec ses scans (pour les requêtes avec relations)
 */
export interface MangaWithScans extends Manga {
    scans: Scan[]
}

/**
 * Entité Scan - Chapitre d'un manga
 */
export interface Scan {
    id?: number
    scanId: string
    chapter: number | null
    title: string
    description: string
    images: string[]
    date: string
    createdAt?: string
}

/**
 * DTO pour créer un scan
 */
export interface CreateScanDTO {
    scanId: string
    chapter: number | null
    title: string
    description?: string
    images: string[]
    date?: string
}

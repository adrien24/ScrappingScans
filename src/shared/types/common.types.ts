/**
 * Types communs utilisés dans toute l'application
 */

export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E }

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>

export enum SiteSource {
    ANIME_SAMA = 'animeSama',
    LELMANGA = 'lelmanga',
    ONE_PIECE = 'onePiece',
}

export enum MangaStatus {
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    HIATUS = 'hiatus',
    CANCELLED = 'cancelled',
}

export enum MediaType {
    MANGA = 'manga',
    MANHWA = 'manhwa',
    MANHUA = 'manhua',
    LIGHT_NOVEL = 'light_novel',
}

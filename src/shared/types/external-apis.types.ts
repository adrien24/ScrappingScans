/**
 * Types pour les APIs externes (MyAnimeList, etc.)
 */

export interface MALMangaSearchResponse {
    id: number
    title: string
    main_picture: {
        medium: string
        large: string
    }
    'start-date': string
    synopsis: string
    mean: number
    updated_at: string
    media_type: string
    status: string
    genres: Array<{
        id: number
        name: string
    }>
    authors: Array<{
        node: {
            id: number
            first_name: string
            last_name: string
        }
        role: string
    }>
}

export interface MALSearchResult {
    node: {
        id: number
        title: string
    }
}

export interface MALSearchResponse {
    data: MALSearchResult[]
}

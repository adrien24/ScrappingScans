export const mangaUrl: string = 'https://anime-sama.org/catalogue/berserk/scan/vf/'

export interface Scan {
    scan_id: string
    chapter: number | null
    title: string
    images?: string[]
}

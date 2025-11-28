/**
 * Types pour le scraping
 */

export interface ScrapedChapter {
    scanId: string
    chapter: number | null
    title: string
    images?: string[]
}

export interface ScrapingResult<T> {
    success: boolean
    data?: T
    error?: string
}

export interface PuppeteerConfig {
    headless: boolean
    executablePath?: string
    args: string[]
}

export interface ScraperOptions {
    timeout?: number
    retries?: number
    delayBetweenRequests?: number
}

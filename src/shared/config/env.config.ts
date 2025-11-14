import * as dotenv from 'dotenv'

dotenv.config()

/**
 * Configuration centralisée de l'application
 */
export const config = {
    // Database
    supabase: {
        url: process.env.SUPABASE_URL!,
        key: process.env.SUPABASE_KEY!,
        email: process.env.SUPABASE_EMAIL!,
        password: process.env.SUPABASE_PASSWORD!,
    },

    // External APIs
    myAnimeList: {
        clientId: process.env.MAL_CLIENT_ID,
        clientSecret: process.env.MAL_CLIENT_SECRET,
    },

    // Scraping
    scraping: {
        timeout: 60000,
        retries: 3,
        delayBetweenRequests: 1000,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },

    // Sites
    sites: {
        animeSama: {
            baseUrl: 'https://anime-sama.org',
            catalogueUrl: 'https://anime-sama.org/catalogue',
        },
        lelmanga: {
            baseUrl: 'https://lelmanga.com',
        },
    },
} as const

/**
 * Validation de la configuration au démarrage
 */
export function validateConfig(): void {
    const required = [
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'SUPABASE_EMAIL',
        'SUPABASE_PASSWORD',
    ]

    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
}

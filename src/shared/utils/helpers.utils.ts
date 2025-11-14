import { Result, AsyncResult } from '../types'

/**
 * Logger utilitaire
 */
export class Logger {
    private context: string

    constructor(context: string) {
        this.context = context
    }

    info(message: string, ...args: any[]): void {
        console.log(`[${this.context}] ℹ️  ${message}`, ...args)
    }

    success(message: string, ...args: any[]): void {
        console.log(`[${this.context}] ✅ ${message}`, ...args)
    }

    warn(message: string, ...args: any[]): void {
        console.warn(`[${this.context}] ⚠️  ${message}`, ...args)
    }

    error(message: string, error?: any): void {
        console.error(`[${this.context}] ❌ ${message}`, error)
    }

    debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${this.context}] 🐛 ${message}`, ...args)
        }
    }
}

/**
 * Créer un Result success
 */
export function success<T>(data: T): Result<T, never> {
    return { success: true, data }
}

/**
 * Créer un Result error
 */
export function failure<E = Error>(error: E): Result<never, E> {
    return { success: false, error }
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry une fonction avec backoff exponentiel
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000,
    backoffFactor: number = 2,
): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error as Error

            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(backoffFactor, attempt)
                await sleep(delay)
            }
        }
    }

    throw lastError!
}

/**
 * Nettoyer une chaîne de caractères
 */
export function sanitizeString(str: string): string {
    return str
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-]/gi, '')
}

/**
 * Formater une date en ISO string
 */
export function formatDateISO(date: Date = new Date()): string {
    return date.toISOString()
}

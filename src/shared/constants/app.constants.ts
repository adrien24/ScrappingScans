/**
 * Constantes de l'application
 */

export const APP_NAME = 'Scrapping Scans'
export const APP_VERSION = '2.0.0'

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const

export const REGEX_PATTERNS = {
    CHAPTER_NUMBER: /(?:^|\b)chapitre\s*[:\-]?\s*(\d+(?:\.\d+)?)/i,
    SIMPLE_NUMBER: /^\s*(\d+(?:\.\d+)?)\s*$/,
} as const

export const TIMEOUTS = {
    NAVIGATION: 60000,
    SELECTOR: 30000,
    SCROLL_INTERVAL: 100,
} as const

export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 10000,
    BACKOFF_FACTOR: 2,
} as const

import { PuppeteerConfig } from '../types'

/**
 * Configuration Puppeteer pour éviter la détection
 */
export const puppeteerConfig: PuppeteerConfig = {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-dev-shm-usage',
        '--disable-gpu',
    ],
}

/**
 * Configuration du viewport
 */
export const viewportConfig = {
    width: 1920,
    height: 1080,
}

/**
 * Configure une page Puppeteer avec les paramètres anti-détection
 */
export async function configurePage(page: any, userAgent: string): Promise<void> {
    await page.setUserAgent(userAgent)
    await page.setViewport(viewportConfig)

    // Masquer les indicateurs de webdriver
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        })
    })
}

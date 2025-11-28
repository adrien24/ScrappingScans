import { prismaDatabaseClient } from '../../core/database'
import { scrapingService } from '../../modules/scraping'
import { Logger } from '../../shared/utils'

const logger = new Logger('UpdateAnimeSama')

/**
 * Script pour mettre à jour tous les mangas AnimeSama
 * 
 * Usage: npm run updateAnimeSama
 */
async function main() {
    try {
        logger.info('Starting AnimeSama update...')

        // Connexion à la base de données
        await prismaDatabaseClient.connect()

        // Mettre à jour tous les mangas
        await scrapingService.updateAllAnimeSamaMangas()

        logger.success('✅ Script completed successfully')
        process.exit(0)
    } catch (error) {
        logger.error('❌ Script failed', error)
        process.exit(1)
    }
}

main()

import { prismaDatabaseClient } from '../../core/database'
import { scrapingService } from '../../modules/scraping'
import { Logger } from '../../shared/utils'
import { config } from '../../shared/config'

const logger = new Logger('AddAnimeSama')

/**
 * Script pour ajouter un nouveau manga depuis AnimeSama
 * 
 * Usage: npm run animeSama
 */
async function main() {
    try {
        // URL du manga à ajouter (Berserk par défaut)
        const mangaUrl = `${config.sites.animeSama.catalogueUrl}/one-piece/scan_noir-et-blanc/vf/`

        logger.info('Starting AnimeSama manga addition...')

        // Connexion à la base de données
        await prismaDatabaseClient.connect()

        // Ajouter le manga
        await scrapingService.addMangaFromAnimeSama(mangaUrl)

        logger.success('✅ Script completed successfully')
        process.exit(0)
    } catch (error) {
        logger.error('❌ Script failed', error)
        process.exit(1)
    }
}

main()

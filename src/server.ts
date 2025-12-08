import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import swaggerUi from 'swagger-ui-express'
import { config } from './shared/config'
import { prismaDatabaseClient } from './core/database/prisma.client'
import { Logger } from './shared/utils'
import { swaggerSpec } from './shared/config/swagger.config'
import mangaRoutes from './api/routes/manga.routes'
import scrapingRoutes from './api/routes/scraping.routes'

const logger = new Logger('Server')

class Server {
    private app: Application
    private port: number

    constructor() {
        this.app = express()
        this.port = parseInt(process.env.PORT || '3000', 10)
        this.setupMiddlewares()
        this.setupRoutes()
    }

    /**
     * Configurer les middlewares
     */
    private setupMiddlewares(): void {
        // Sécurité (désactiver CSP pour Swagger UI)
        this.app.use(
            helmet({
                contentSecurityPolicy: false,
            })
        )

        // CORS
        this.app.use(
            cors({
                origin: process.env.CORS_ORIGIN || '*',
                credentials: true,
            })
        )

        // Compression
        this.app.use(compression())

        // Body parsers
        this.app.use(express.json({ limit: '10mb' }))
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))

        // Logging middleware
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`)
            next()
        })
    }

    /**
     * Configurer les routes
     */
    private setupRoutes(): void {
        // Swagger documentation
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'ScrappingScan API Documentation',
        }))

        // Health check
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            })
        })

        // API routes
        this.app.use('/api/mangas', mangaRoutes)
        this.app.use('/api/scraping', scrapingRoutes)

        // 404 handler
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({
                error: 'Not Found',
                path: req.path,
            })
        })

        // Error handler
        this.app.use((err: Error, req: Request, res: Response, next: any) => {
            logger.error('Unhandled error', err)
            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? err.message : undefined,
            })
        })
    }

    /**
     * Démarrer le serveur
     */
    async start(): Promise<void> {
        try {
            // Connecter à la base de données
            await prismaDatabaseClient.connect()
            logger.success('Database connected')

            // Démarrer le serveur
            this.app.listen(this.port, '0.0.0.0', () => {
                logger.success(`🚀 Server running on http://localhost:${this.port}`)
                logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
                logger.info(`API Documentation:`)
                logger.info(`  - GET    /health`)
                logger.info(`  - GET    /api/mangas/:title`)
                logger.info(`  - GET    /api/mangas/site/:site`)
                logger.info(`  - GET    /api/mangas/:title/scans`)
                logger.info(`  - POST   /api/mangas`)
                logger.info(`  - POST   /api/mangas/:title/scans`)
                logger.info(`  - POST   /api/scraping/add-manga`)
                logger.info(`  - POST   /api/scraping/update-manga`)
                logger.info(`  - POST   /api/scraping/update-all`)
            })
        } catch (error) {
            logger.error('Failed to start server', error)
            process.exit(1)
        }
    }

    /**
     * Arrêter le serveur proprement
     */
    async stop(): Promise<void> {
        await prismaDatabaseClient.disconnect()
        logger.info('Server stopped')
    }
}

// Gestion des signaux d'arrêt
const server = new Server()

process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully')
    await server.stop()
    process.exit(0)
})

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully')
    await server.stop()
    process.exit(0)
})

// Démarrer le serveur
server.start()

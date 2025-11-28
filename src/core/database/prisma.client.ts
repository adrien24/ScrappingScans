import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { Logger } from '../../shared/utils'

const logger = new Logger('PrismaClient')

/**
 * Client Prisma singleton
 */
class PrismaDatabaseClient {
    private static instance: PrismaDatabaseClient
    private client: PrismaClient
    private pool: Pool

    private constructor() {
        // Créer le pool de connexion PostgreSQL
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        })

        // Créer l'adaptateur Prisma avec le pool
        const adapter = new PrismaPg(this.pool)

        // Initialiser le client Prisma avec l'adaptateur
        this.client = new PrismaClient({
            adapter,
            log: ['error', 'warn'],
        })
    }

    /**
     * Obtenir l'instance singleton
     */
    public static getInstance(): PrismaDatabaseClient {
        if (!PrismaDatabaseClient.instance) {
            PrismaDatabaseClient.instance = new PrismaDatabaseClient()
        }
        return PrismaDatabaseClient.instance
    }

    /**
     * Obtenir le client Prisma
     */
    public getClient(): PrismaClient {
        return this.client
    }

    /**
     * Connecter à la base de données
     */
    public async connect(): Promise<void> {
        try {
            await this.client.$connect()
            logger.success('Connected to database')
        } catch (error) {
            logger.error('Database connection error', error)
            throw error
        }
    }

    /**
     * Déconnecter de la base de données
     */
    public async disconnect(): Promise<void> {
        try {
            await this.client.$disconnect()
            await this.pool.end()
            logger.info('Disconnected from database')
        } catch (error) {
            logger.error('Database disconnection error', error)
            throw error
        }
    }
}

// Export de l'instance singleton
export const prismaDatabaseClient = PrismaDatabaseClient.getInstance()
export const prisma = prismaDatabaseClient.getClient()

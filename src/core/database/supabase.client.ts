import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config, validateConfig } from '../../shared/config'
import { Logger } from '../../shared/utils'

const logger = new Logger('SupabaseClient')

/**
 * Client Supabase singleton
 */
class SupabaseDatabaseClient {
    private static instance: SupabaseDatabaseClient
    private client: SupabaseClient
    private isAuthenticated: boolean = false

    private constructor() {
        validateConfig()
        this.client = createClient(config.supabase.url, config.supabase.key)
    }

    /**
     * Obtenir l'instance singleton
     */
    public static getInstance(): SupabaseDatabaseClient {
        if (!SupabaseDatabaseClient.instance) {
            SupabaseDatabaseClient.instance = new SupabaseDatabaseClient()
        }
        return SupabaseDatabaseClient.instance
    }

    /**
     * Obtenir le client Supabase
     */
    public getClient(): SupabaseClient {
        return this.client
    }

    /**
     * Authentifier l'utilisateur
     */
    public async authenticate(): Promise<void> {
        if (this.isAuthenticated) {
            logger.info('Already authenticated')
            return
        }

        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: config.supabase.email,
                password: config.supabase.password,
            })

            if (error) {
                throw new Error(`Authentication failed: ${error.message}`)
            }

            this.isAuthenticated = true
            logger.success(`User authenticated: ${data.user.email}`)
        } catch (error) {
            logger.error('Authentication error', error)
            throw error
        }
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    public isAuth(): boolean {
        return this.isAuthenticated
    }
}

// Export de l'instance singleton
export const supabaseClient = SupabaseDatabaseClient.getInstance()
export const supabase = supabaseClient.getClient()

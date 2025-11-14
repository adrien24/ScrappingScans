import axios from 'axios'
import * as crypto from 'crypto'
import * as http from 'http'
import * as fs from 'fs'
import * as open from 'open'
import * as path from 'path'
import { MALMangaSearchResponse, MALSearchResponse } from '../../shared/types'
import { Logger } from '../../shared/utils'
import { config } from '../../shared/config'

const logger = new Logger('MALClient')

const CLIENT_ID = config.myAnimeList.clientId || '9ea7b9a74b6658e907815ab7e6375323'
const CLIENT_SECRET = config.myAnimeList.clientSecret || '3dc19780a306163e77e7bba30469a1ba97a25d09e4f229cbe4b3043a134c4704'
const REDIRECT_URI = 'http://localhost:3085/callback'
const TOKEN_FILE = path.join(process.cwd(), 'mal_token.json')

interface TokenData {
    access_token: string
    refresh_token: string
    expires_in: number
    created_at: number
}

/**
 * Client pour l'API MyAnimeList
 */
class MyAnimeListClient {
    private static instance: MyAnimeListClient

    private constructor() { }

    public static getInstance(): MyAnimeListClient {
        if (!MyAnimeListClient.instance) {
            MyAnimeListClient.instance = new MyAnimeListClient()
        }
        return MyAnimeListClient.instance
    }

    private saveToken(tokenData: TokenData): void {
        fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2))
    }

    private loadToken(): TokenData | null {
        if (!fs.existsSync(TOKEN_FILE)) return null
        return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
    }

    private isTokenValid(tokenData: TokenData): boolean {
        if (!tokenData?.created_at || !tokenData?.expires_in) return false
        const expiresAt = tokenData.created_at + tokenData.expires_in * 1000
        return Date.now() < expiresAt
    }

    private async refreshToken(oldToken: TokenData): Promise<TokenData | null> {
        logger.info('Refreshing token...')

        try {
            const res = await axios.post(
                'https://myanimelist.net/v1/oauth2/token',
                new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: oldToken.refresh_token,
                }),
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                },
            )

            const newToken: TokenData = {
                ...res.data,
                created_at: Date.now(),
            }

            this.saveToken(newToken)
            logger.success('Token refreshed')
            return newToken
        } catch (error) {
            logger.error('Failed to refresh token', error)
            return null
        }
    }

    private base64URLEncode(str: Buffer): string {
        return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    }

    private async authorize(): Promise<TokenData> {
        const codeVerifier = this.base64URLEncode(crypto.randomBytes(96)).substring(0, 128)

        const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
            REDIRECT_URI,
        )}&state=request123&code_challenge=${codeVerifier}&code_challenge_method=plain`

        return new Promise((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                if (!req.url?.startsWith('/callback')) return

                const url = new URL(req.url, REDIRECT_URI)
                const code = url.searchParams.get('code')

                if (!code) {
                    res.end('❌ Error: No code received.')
                    reject(new Error('No code received'))
                    return
                }

                res.end('✅ Code received! You can return to the console.')
                server.close()

                try {
                    const tokenRes = await axios.post(
                        'https://myanimelist.net/v1/oauth2/token',
                        new URLSearchParams({
                            client_id: CLIENT_ID,
                            client_secret: CLIENT_SECRET,
                            grant_type: 'authorization_code',
                            code,
                            redirect_uri: REDIRECT_URI,
                            code_verifier: codeVerifier,
                        }),
                        {
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        },
                    )

                    const tokenData: TokenData = {
                        ...tokenRes.data,
                        created_at: Date.now(),
                    }

                    this.saveToken(tokenData)
                    logger.success('New token obtained')
                    resolve(tokenData)
                } catch (err) {
                    reject(err)
                }
            })

            server.listen(3085, () => {
                logger.info('Server ready on http://localhost:3085/callback')
                logger.info('Opening browser for authorization...')
                    ; (open as any).default(authUrl)
            })
        })
    }

    /**
     * Obtenir un token d'accès valide
     */
    public async getAccessToken(): Promise<string> {
        let tokenData = this.loadToken()

        if (tokenData) {
            if (this.isTokenValid(tokenData)) {
                return tokenData.access_token
            }
            const refreshed = await this.refreshToken(tokenData)
            if (refreshed) return refreshed.access_token
        }

        tokenData = await this.authorize()
        return tokenData.access_token
    }

    /**
     * Rechercher un manga par titre
     */
    public async searchManga(title: string): Promise<number> {
        if (!title) throw new Error('Title is required')

        const token = await this.getAccessToken()
        const url = `https://api.myanimelist.net/v2/manga?q=${encodeURIComponent(title)}`

        try {
            const response = await axios.get<MALSearchResponse>(url, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!response.data || !response.data.data || response.data.data.length === 0) {
                throw new Error('Manga not found in MyAnimeList')
            }

            return response.data.data[0].node.id
        } catch (error: any) {
            const status = error?.response?.status
            const statusText = error?.response?.statusText || error?.message
            throw new Error(`MAL API error ${status || 'ERR'} ${statusText}`)
        }
    }

    /**
     * Obtenir les détails d'un manga par son ID
     */
    public async getMangaDetails(id: number): Promise<MALMangaSearchResponse> {
        const token = await this.getAccessToken()
        const url = `https://api.myanimelist.net/v2/manga/${id}?fields=main_picture,start_date,end_date,synopsis,mean,updated_at,media_type,status,genres,authors{first_name,last_name}`

        try {
            const response = await axios.get<MALMangaSearchResponse>(url, {
                headers: { Authorization: `Bearer ${token}` },
            })

            return response.data
        } catch (error) {
            logger.error('Error fetching manga details from MAL', error)
            throw error
        }
    }

    /**
     * Rechercher et obtenir les détails d'un manga par titre
     */
    public async findMangaByTitle(title: string): Promise<MALMangaSearchResponse> {
        const id = await this.searchManga(title)
        return this.getMangaDetails(id)
    }
}

export const malClient = MyAnimeListClient.getInstance()

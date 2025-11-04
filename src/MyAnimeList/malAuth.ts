import crypto from 'crypto'
import http from 'http'
import fs from 'fs'
import open from 'open'
import fetch from 'node-fetch'

const CLIENT_ID = '9ea7b9a74b6658e907815ab7e6375323'
const CLIENT_SECRET = '3dc19780a306163e77e7bba30469a1ba97a25d09e4f229cbe4b3043a134c4704'
const REDIRECT_URI = 'http://localhost:3085/callback'
const TOKEN_FILE = './mal_token.json'

function saveToken(tokenData: any) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2))
}

function loadToken() {
  if (!fs.existsSync(TOKEN_FILE)) return null
  return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'))
}

function isTokenValid(tokenData: any): boolean {
  if (!tokenData?.created_at || !tokenData?.expires_in) return false
  const expiresAt = tokenData.created_at + tokenData.expires_in * 1000
  return Date.now() < expiresAt
}

async function refreshToken(oldToken: any) {
  console.log('🔄 Rafraîchissement du token...')
  const res = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: oldToken.refresh_token,
    }),
  })

  const newToken: any = await res.json()
  if (newToken.error) {
    console.error('❌ Erreur de rafraîchissement :', newToken)
    return null
  }

  newToken.created_at = Date.now()
  saveToken(newToken)
  console.log('✅ Token rafraîchi !')
  return newToken
}

function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function authorize(): Promise<any> {
  // Générer code_verifier (128 caractères pour être sûr)
  // MAL n'accepte que la méthode 'plain', donc code_challenge = code_verifier
  const codeVerifier = base64URLEncode(crypto.randomBytes(96)).substring(0, 128)
  console.log('🔑 Code verifier:', codeVerifier, '(longueur:', codeVerifier.length, ')')

  const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&state=request123&code_challenge=${codeVerifier}&code_challenge_method=plain`

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req: any, res: any) => {
      if (!req.url?.startsWith('/callback')) return

      const url = new URL(req.url, REDIRECT_URI)
      const code = url.searchParams.get('code')

      if (!code) {
        res.end('❌ Erreur : pas de code reçu.')
        reject(new Error('Pas de code reçu'))
        return
      }

      res.end('✅ Code reçu ! Tu peux revenir à la console.')
      server.close()

      try {
        const tokenRes = await fetch('https://myanimelist.net/v1/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
          }),
        })

        const tokenData: any = await tokenRes.json()
        if (tokenData.error) {
          console.error('❌ Erreur lors de la récupération du token :', tokenData)
          reject(new Error(tokenData.error))
          return
        }

        tokenData.created_at = Date.now()
        saveToken(tokenData)
        console.log('✅ Nouveau token obtenu !')
        resolve(tokenData)
      } catch (err) {
        reject(err)
      }
    })

    server.listen(3085, () => {
      console.log('➡️ Serveur prêt sur http://localhost:3085/callback')
      console.log('🌐 Ouvre ton navigateur pour autoriser ton appli...')
      console.log(authUrl)
      open(authUrl)
    })
  })
}

export async function getMALToken(): Promise<string> {
  let tokenData = loadToken()

  if (tokenData) {
    if (isTokenValid(tokenData)) {
      return tokenData.access_token
    }
    const refreshed: any = await refreshToken(tokenData)
    if (refreshed) return refreshed.access_token
  }

  tokenData = (await authorize()) as any
  return tokenData.access_token
}

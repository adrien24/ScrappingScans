# 🚀 Guide de Déploiement

## Architecture

- **PostgreSQL** : Installation native (performance maximale)
- **API** : Node.js natif (PM2 pour la gestion des processus)

## 📦 Déploiement Production

### Prérequis

- Node.js 20+
- PostgreSQL 16+
- PM2 (optionnel mais recommandé)

### Étapes de déploiement

```bash
# 1. Installer PostgreSQL
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@16
brew services start postgresql@16

# 2. Créer la base de données
sudo -u postgres psql -c "CREATE DATABASE scrappingscan;"
sudo -u postgres psql -c "CREATE USER scrappingscan WITH PASSWORD 'votre_password_securise';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scrappingscan TO scrappingscan;"

# 3. Cloner le projet
git clone https://github.com/votre-repo/ScrappingScan.git
cd ScrappingScan

# 4. Installer les dépendances
npm install

# 5. Configurer l'environnement
cp .env.local .env
nano .env  # Modifier DATABASE_URL avec votre config

# 6. Appliquer les migrations
npm run prisma:migrate

# 7. Build
npm run build

# 8. Démarrer avec PM2
npm install -g pm2
pm2 start dist/server.js --name scrappingscan-api
pm2 save
pm2 startup
```

**Railway :**

```bash
# 1. Créer un projet sur Railway
# 2. Ajouter un service PostgreSQL
# 3. Connecter votre repo GitHub
# 4. Variables d'environnement :
DATABASE_URL=<fourni par Railway>
PORT=3000
NODE_ENV=production

# Railway gère automatiquement :
# - npm install
# - npm run build
# - npm run start
```

**Vercel (avec Vercel Postgres) :**

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Ajouter Vercel Postgres dans le dashboard
# 4. Les variables DATABASE_URL sont ajoutées automatiquement
```

## 🔒 Sécurité Production

### Variables d'environnement

```bash
# .env (production)
DATABASE_URL="postgresql://user:password@host:5432/db"
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://votre-frontend.com  # Restreindre CORS
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## 📊 Monitoring

### PM2 Monitoring

```bash
# Logs
pm2 logs scrappingscan-api

# Status
pm2 status

# Redémarrer
pm2 restart scrappingscan-api

# Monitoring web
pm2 plus
```

### PostgreSQL Backup

```bash
# Backup automatique quotidien
crontab -e

# Ajouter :
0 2 * * * pg_dump -U scrappingscan scrappingscan > /backup/db_$(date +\%Y\%m\%d).sql
```

## 🔄 Mise à jour

```bash
# 1. Pull les changements
git pull

# 2. Installer nouvelles dépendances
npm install

# 3. Migrations si nécessaire
npm run prisma:migrate

# 4. Rebuild
npm run build

# 5. Redémarrer
pm2 restart scrappingscan-api
```

## ⚠️ Notes Importantes

### Scraping en Production

**Le scraping avec Cloudflare est problématique en production.**

Solutions recommandées :

1. **Scraper en local, sync la DB**

   ```bash
   # Local
   npm run dev:local
   curl POST /api/scraping/add-manga

   # Puis sync la DB vers prod
   pg_dump local_db | psql production_db
   ```

2. **VPS dédié au scraping**
   - Un serveur uniquement pour scraper
   - Sync périodique vers la prod

3. **Service externe**
   - ScraperAPI, Bright Data, etc.
   - Meilleure fiabilité contre Cloudflare

### Limites de Ressources

**Puppeteer consomme beaucoup de RAM :**

- Minimum 2GB RAM recommandé
- Limiter le nombre de scraping simultanés
- Utiliser une queue (Bull, BullMQ) si volume élevé

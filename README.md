# 🎯 ScrappingScan - API REST de Scraping de Mangas

API REST Node.js/Express pour scraper et gérer des mangas depuis AnimeSama.

## 🚀 Démarrage Rapide

```bash
# 1. Installer PostgreSQL
brew install postgresql@16  # macOS
# Ou voir docs/QUICK_START.md pour Linux/Windows

# 2. Créer la base de données
psql postgres -c "CREATE DATABASE scrappingscan;"
psql postgres -c "CREATE USER scrappingscan WITH PASSWORD 'scrappingscan_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE scrappingscan TO scrappingscan;"

# 3. Installer les dépendances
npm install

# 4. Configurer l'environnement
cp .env.local .env

# 5. Appliquer les migrations
npm run prisma:migrate

# 6. Lancer l'API
npm run dev:local
```

✅ API disponible sur **http://localhost:3000**

---

## ⚡ Commandes npm

### Développement

```bash
npm run dev:local      # Mode watch avec hot-reload ⚡
npm run start:local    # Mode production local
npm run build          # Compiler TypeScript
```

### Base de données

```bash
npm run prisma:migrate  # Créer/appliquer migrations
npm run prisma:studio   # Interface graphique DB
npm run prisma:generate # Générer le client Prisma
```

---

## 🌐 Endpoints API

### Health & Info

```bash
GET  /health  # Status de l'API
```

### Mangas

```bash
GET  /api/mangas/:title        # Récupérer un manga par titre
GET  /api/mangas/site/:site    # Liste des mangas par site
GET  /api/mangas/:title/scans  # Liste des scans d'un manga
POST /api/mangas               # Créer un manga
POST /api/mangas/:title/scans  # Ajouter un scan
```

### Scraping

```bash
POST /api/scraping/add-manga      # Scraper un nouveau manga
POST /api/scraping/update-manga   # Mettre à jour un manga
POST /api/scraping/update-all     # Mettre à jour tous les mangas
```

**Exemple - Ajouter un manga :**

```bash
curl -X POST https://api.adrienbouteiller.fr/api/scraping/add-manga \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://anime-sama.eu/catalogue/haikyuu/scan/vf/",
    "site": "ANIME_SAMA"
  }'
```

**Réponse :**
```json
{
  "message": "Manga scraping started",
  "url": "https://anime-sama.eu/catalogue/haikyuu/scan/vf/"
}
```

> ⚠️ Le scraping est **asynchrone**. L'API retourne immédiatement (202 Accepted) et le scraping continue en arrière-plan.

**Gérer le scraping en cours :**

```bash
# Voir les logs en temps réel (mode direct/suivi)
pm2 logs scrappingscan-api

# Voir les dernières lignes sans suivre
pm2 logs scrappingscan-api --lines 50 --nostream

# Filtrer les logs (erreurs uniquement)
pm2 logs scrappingscan-api --err

# Vider les logs
pm2 flush scrappingscan-api

# Arrêter le scraping en cours (redémarre l'app)
pm2 restart scrappingscan-api

# Stopper complètement l'app
pm2 stop scrappingscan-api

# Redémarrer l'app
pm2 start scrappingscan-api

# Voir l'état et la consommation
pm2 status
pm2 monit  # Interface interactive avec CPU/RAM
```

**Suivre le scraping en direct :**

```bash
# Ouvrir les logs en temps réel dans un terminal
pm2 logs scrappingscan-api

# Vous verrez défiler :
# [AnimeSamaScraper] ℹ️  Scraping chapters from: https://...
# [AnimeSamaScraper] ✅ Found 409 chapters
# [ScrapingService] ℹ️  Processing chapter 1: Chapitre 1
# [AnimeSamaScraper] ℹ️  Scraping images for chapter: Chapitre 1
# [AnimeSamaScraper] ✅ Found 19 images
# [ScanRepositoryPrisma] ✅ Scan created: Chapter 1 - Chapitre 1

# Pour quitter : Ctrl+C
```

---

## 📚 Documentation

- **[API Documentation (Swagger)](https://api.adrienbouteiller.fr/api-docs/)** - Documentation interactive des endpoints
- **[docs/QUICK_START.md](./docs/QUICK_START.md)** - Installation PostgreSQL + Workflow de développement
- **[docs/DEPLOYMENT_SIMPLE.md](./docs/DEPLOYMENT_SIMPLE.md)** - Guide de déploiement production

### API en Production

🌐 **Production** : https://api.adrienbouteiller.fr  
📖 **Swagger UI** : https://api.adrienbouteiller.fr/api-docs/  
✅ **Health Check** : https://api.adrienbouteiller.fr/health

---

## 🛠️ Stack Technique

- **Runtime** : Node.js 20
- **Framework** : Express 5
- **Language** : TypeScript 5
- **Database** : PostgreSQL 16
- **ORM** : Prisma 6
- **Scraping** : Puppeteer + Stealth Plugin
- **Dev** : tsx (hot-reload)

---

## 📝 Configuration

### Variables d'environnement (.env)

```env
DATABASE_URL="postgresql://scrappingscan:scrappingscan_password@localhost:5432/scrappingscan"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Services

- **API** : http://localhost:3000
- **PostgreSQL** : localhost:5432
- **Prisma Studio** : http://localhost:5555

---

## 📊 Structure du Projet

```
ScrappingScan/
├── README.md              ← Vous êtes ici
├── docs/                  ← Documentation
│   ├── POSTGRESQL_INSTALL.md
│   ├── QUICK_START.md
│   └── DEPLOYMENT_SIMPLE.md
├── src/
│   ├── server.ts          ← Point d'entrée
│   ├── api/               ← Controllers & Routes
│   ├── modules/           ← Manga & Scraping
│   ├── core/              ← Database
│   └── shared/            ← Config & Utils
├── prisma/
│   └── schema.prisma      ← Schéma DB
├── .env.local             ← Config template
├── package.json
└── tsconfig.json
```

---

## 💡 Workflow de Développement

1. **Lancer l'API** : `npm run dev:local`
2. **Modifier le code** : Les changements se rechargent automatiquement ⚡
3. **Tester** : `curl http://localhost:3000/health`
4. **Visualiser la DB** : `npm run prisma:studio`
5. **Commit** : `git commit -m "..." && git push`

---

## ⚠️ Notes Importantes

### Scraping et Cloudflare

Le site anime-sama.eu utilise **Cloudflare**. Le scraping peut :

- ⏱️ Prendre du temps (validation Cloudflare, ~5-10s par chapitre)
- ❌ Échouer si bloqué par l'anti-bot
- 🔄 Nécessiter plusieurs tentatives
- 🚫 Être bloqué en production (voir solutions ci-dessous)

**Le scraping est asynchrone** : L'endpoint retourne immédiatement (202 Accepted) et continue en arrière-plan.

**Solutions pour la production :**
1. **Scraper en local** et synchroniser la base de données vers la production
2. **Serveur dédié** uniquement pour le scraping
3. **Services externes** (ScraperAPI, Bright Data, etc.)

### Arrêter un scraping en cours

Le scraping s'exécute en tâche de fond. Pour l'arrêter ou le surveiller :

```bash
# 🔴 Voir les logs en TEMPS RÉEL (Ctrl+C pour quitter)
pm2 logs scrappingscan-api

# 📊 Interface monitoring interactive (CPU/RAM)
pm2 monit

# 📝 Voir les dernières lignes sans suivre
pm2 logs scrappingscan-api --lines 100 --nostream

# 🔄 Redémarrer l'application (interrompt le scraping)
pm2 restart scrappingscan-api

# 🛑 Stopper complètement
pm2 stop scrappingscan-api

# ✅ Redémarrer après un stop
pm2 start scrappingscan-api

# 📈 Voir l'état et les stats
pm2 status
```

**Exemple de logs en direct :**

```
[AnimeSamaScraper] ℹ️  Scraping chapters from: https://anime-sama.eu/...
[AnimeSamaScraper] ✅ Found 409 chapters
[ScrapingService] ℹ️  Processing chapter 1: Chapitre 1
[AnimeSamaScraper] ℹ️  Scraping images for chapter: Chapitre 1
[AnimeSamaScraper] ✅ Found 19 images
[ScanRepositoryPrisma] ✅ Scan created: Chapter 1 - Chapitre 1
[ScrapingService] ℹ️  Processing chapter 2: Chapitre 2
...
```

### Performances

Puppeteer consomme beaucoup de RAM :

- **Minimum 2GB RAM** recommandé
- Ne pas exécuter trop de scraping simultanés
- Le navigateur se ferme automatiquement après chaque scraping
- Un manga de 400+ chapitres peut prendre plusieurs heures

---

## 🎉 Prêt à commencer ?

Suivez le [Guide de démarrage rapide](#-démarrage-rapide) ci-dessus !

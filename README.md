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
POST /api/scraping/add-manga    # Scraper un nouveau manga
POST /api/scraping/update-manga # Mettre à jour un manga
```

**Exemple :**

```bash
curl -X POST http://localhost:3000/api/scraping/add-manga \
  -H "Content-Type: application/json" \
  -d '{"url": "https://anime-sama.tv/catalogue/kagura-bachi/scan/vf.html"}'
```

---

## 📚 Documentation

- **[docs/QUICK_START.md](./docs/QUICK_START.md)** - Installation PostgreSQL + Workflow de développement
- **[docs/DEPLOYMENT_SIMPLE.md](./docs/DEPLOYMENT_SIMPLE.md)** - Guide de déploiement production

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

Le site anime-sama.tv utilise **Cloudflare**. Le scraping peut :

- Prendre du temps (validation Cloudflare)
- Échouer si bloqué par l'anti-bot
- Nécessiter plusieurs tentatives

### Performances

Puppeteer consomme beaucoup de RAM :

- Ne pas exécuter trop de scraping simultanés
- Fermer le navigateur après chaque scraping

---

## 🎉 Prêt à commencer ?

Suivez le [Guide de démarrage rapide](#-démarrage-rapide) ci-dessus !

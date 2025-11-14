# 🏗️ Architecture du Projet - Scrapping Scans v2.0

## 📋 Vue d'Ensemble

Cette architecture suit les principes de **Clean Architecture** et **Domain-Driven Design (DDD)**, conçue pour être facilement transformable en API REST.

## 📁 Structure des Dossiers

```
src/
├── shared/                     # Code partagé dans toute l'application
│   ├── types/                  # Définitions TypeScript
│   │   ├── common.types.ts     # Types communs (Result, Enums, etc.)
│   │   ├── manga.types.ts      # Types du domaine manga
│   │   ├── external-apis.types.ts  # Types pour APIs externes
│   │   └── scraping.types.ts   # Types pour le scraping
│   ├── config/                 # Configuration
│   │   ├── env.config.ts       # Variables d'environnement
│   │   └── puppeteer.config.ts # Config Puppeteer
│   ├── constants/              # Constantes de l'application
│   └── utils/                  # Utilitaires (Logger, helpers)
│
├── core/                       # Couche infrastructure
│   ├── database/               # Clients de base de données
│   │   └── supabase.client.ts  # Client Supabase singleton
│   └── external-apis/          # Clients pour APIs externes
│       └── mal.client.ts       # Client MyAnimeList
│
├── modules/                    # Modules métier
│   ├── manga/                  # Module Manga
│   │   ├── domain/             # Interfaces du domaine
│   │   ├── repositories/       # Accès aux données
│   │   └── services/           # Logique métier
│   └── scraping/               # Module Scraping
│       ├── scrapers/           # Scrapers par site
│       └── services/           # Services de scraping
│
└── scripts/                    # Scripts CLI
    ├── add-manga/              # Scripts d'ajout de mangas
    └── update-manga/           # Scripts de mise à jour
```

## 🎯 Principes d'Architecture

### 1. **Séparation des Responsabilités**

- **shared** : Code réutilisable partout
- **core** : Infrastructure (DB, APIs externes)
- **modules** : Logique métier organisée par domaine
- **scripts** : Points d'entrée CLI

### 2. **Dependency Inversion**

Les modules métier ne dépendent jamais de l'infrastructure :

```
modules/manga → interfaces
core/database → implémente ces interfaces
```

### 3. **Singleton Pattern**

Tous les clients et services utilisent le pattern Singleton :

```typescript
export const supabaseClient = SupabaseDatabaseClient.getInstance()
export const mangaService = MangaService.getInstance()
```

### 4. **Repository Pattern**

L'accès aux données est abstrait via des repositories :

```typescript
interface IMangaRepository {
  findByTitle(title: string): Promise<Manga | null>
  create(manga: Partial<Manga>): Promise<Manga>
}
```

## 📦 Modules Principaux

### **Shared**

Code partagé dans toute l'application.

**Types** :

- `Result<T, E>` : Type pour gérer success/error
- `SiteSource` : Enum des sites sources
- `Manga`, `Scan` : Entités du domaine

**Utils** :

- `Logger` : Logging avec contexte
- `success()`, `failure()` : Helpers pour Result
- `retryWithBackoff()` : Retry avec backoff exponentiel

### **Core**

Infrastructure et clients externes.

**Database** :

- `SupabaseClient` : Singleton pour Supabase
- Méthode `authenticate()` pour l'auth

**External APIs** :

- `MALClient` : Client MyAnimeList
- Gestion automatique des tokens
- Méthodes `searchManga()`, `getMangaDetails()`

### **Modules**

Logique métier organisée par domaine.

**Manga** :

- **Domain** : Interfaces (IMangaRepository, IScanRepository)
- **Repositories** : Implémentations avec Supabase
- **Services** : Logique métier (MangaService)

**Scraping** :

- **Scrapers** : Un scraper par site (AnimeSamaScraper)
- **Services** : Orchestration du scraping (ScrapingService)

## 🚀 Utilisation

### Scripts CLI

```bash
# Ajouter un nouveau manga AnimeSama
npm run animeSama

# Mettre à jour tous les mangas AnimeSama
npm run updateAnimeSama
npm run update
```

### Dans le Code

```typescript
import { supabaseClient } from './core/database'
import { mangaService } from './modules/manga'
import { scrapingService } from './modules/scraping'

// Authentification
await supabaseClient.authenticate()

// Ajouter un manga
await scrapingService.addMangaFromAnimeSama(url)

// Récupérer un manga
const manga = await mangaService.getMangaByTitle('Berserk')
```

## 🔄 Migration vers API REST

Cette architecture est **prête pour une API REST**. Voici comment :

### Structure Suggérée pour l'API

```
src/
├── shared/          # Inchangé
├── core/            # Inchangé
├── modules/         # Inchangé
├── api/             # NOUVEAU
│   ├── routes/
│   │   ├── manga.routes.ts
│   │   └── scraping.routes.ts
│   ├── controllers/
│   │   ├── manga.controller.ts
│   │   └── scraping.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   └── server.ts
└── scripts/         # Inchangé
```

### Exemple de Controller

```typescript
// api/controllers/manga.controller.ts
import { mangaService } from '../../modules/manga'
import { Request, Response } from 'express'

export class MangaController {
  async getMangaByTitle(req: Request, res: Response) {
    const { title } = req.params
    const manga = await mangaService.getMangaByTitle(title)

    if (!manga) {
      return res.status(404).json({ error: 'Manga not found' })
    }

    return res.json({ data: manga })
  }

  async getAllMangas(req: Request, res: Response) {
    const { site } = req.query
    const mangas = await mangaService.getMangasBySite(site)
    return res.json({ data: mangas })
  }
}
```

### Exemple de Routes

```typescript
// api/routes/manga.routes.ts
import { Router } from 'express'
import { MangaController } from '../controllers/manga.controller'

const router = Router()
const controller = new MangaController()

router.get('/mangas', controller.getAllMangas)
router.get('/mangas/:title', controller.getMangaByTitle)

export default router
```

## ✨ Avantages de Cette Architecture

### 1. **Testabilité**

- Services isolés = faciles à tester
- Repositories mockables
- Pas de dépendances circulaires

### 2. **Maintenabilité**

- Code organisé par domaine
- Séparation claire des responsabilités
- Easy to navigate

### 3. **Scalabilité**

- Facile d'ajouter de nouveaux modules
- Facile d'ajouter de nouveaux scrapers
- Facile de transformer en microservices

### 4. **Réutilisabilité**

- Types partagés
- Configuration centralisée
- Services réutilisables

### 5. **Type Safety**

- TypeScript everywhere
- Interfaces claires
- Pas de `any` (sauf cas spéciaux)

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env` :

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_EMAIL=your_email
SUPABASE_PASSWORD=your_password
MAL_CLIENT_ID=your_mal_client_id
MAL_CLIENT_SECRET=your_mal_client_secret
```

### TypeScript

Le projet utilise :

- **Target** : ES2020
- **Module** : CommonJS
- **Strict Mode** : Activé
- **Path Aliases** : @shared, @core, @modules (optionnel)

## 📝 Bonnes Pratiques

1. **Toujours utiliser les Singletons** pour les services et clients
2. **Toujours logger les actions** avec le Logger
3. **Utiliser les types Result<T, E>** pour les opérations qui peuvent échouer
4. **Ne jamais exécuter de code au top-level** sauf dans les scripts
5. **Toujours authentifier** avant d'utiliser Supabase
6. **Préférer les noms explicites** aux abréviations

## 🎓 Exemples d'Extension

### Ajouter un Nouveau Site de Scraping

1. Créer le scraper :

```typescript
// modules/scraping/scrapers/newSite.scraper.ts
export class NewSiteScraper {
  async scrapeChapters(url: string): Promise<ScrapedChapter[]> {
    // Implementation
  }
}
```

2. Ajouter dans le service de scraping :

```typescript
// modules/scraping/services/scraping.service.ts
async addMangaFromNewSite(url: string) {
  // Implementation
}
```

3. Créer le script CLI :

```typescript
// scripts/add-manga/newSite.script.ts
await scrapingService.addMangaFromNewSite(url)
```

## 📊 Diagramme d'Architecture

```
┌─────────────┐
│   Scripts   │  (Points d'entrée CLI)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Modules   │  (Logique métier)
│  - manga    │
│  - scraping │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Core     │  (Infrastructure)
│  - database │
│  - APIs     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Shared    │  (Code partagé)
│  - types    │
│  - config   │
│  - utils    │
└─────────────┘
```

## 🎉 Résultat

✅ Architecture propre et professionnelle
✅ Prête pour l'API REST
✅ Testable et maintenable
✅ Extensible facilement
✅ Type-safe avec TypeScript
✅ Logs structurés
✅ Gestion d'erreurs propre

---

**Version** : 2.0.0  
**Auteur** : Scrapping Scans Team  
**Date** : Novembre 2025

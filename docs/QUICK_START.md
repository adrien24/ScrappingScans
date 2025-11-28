# 🚀 Guide Rapide - Développement Local

## Architecture

- **PostgreSQL** : Local (installation native)
- **API** : Local (hot-reload et performance)

## Installation PostgreSQL

### macOS

```bash
# Via Homebrew
brew install postgresql@16
brew services start postgresql@16

# Créer la base de données
psql postgres -c "CREATE DATABASE scrappingscan;"
psql postgres -c "CREATE USER scrappingscan WITH PASSWORD 'scrappingscan_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE scrappingscan TO scrappingscan;"
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Créer la base de données
sudo -u postgres psql -c "CREATE DATABASE scrappingscan;"
sudo -u postgres psql -c "CREATE USER scrappingscan WITH PASSWORD 'scrappingscan_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scrappingscan TO scrappingscan;"
```

### Windows

1. Téléchargez depuis https://www.postgresql.org/download/windows/
2. Installez avec les paramètres par défaut
3. Utilisez pgAdmin ou psql pour créer la base

## Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.local .env

# 3. Appliquer les migrations
npm run prisma:migrate

# 4. Lancer l'API
npm run dev:local
```

**Avantages :**

- ✅ **Hot-reload instantané** (tsx watch)
- ✅ **Modifications visibles immédiatement**
- ✅ **Debugging facile** (logs directs)
- ✅ **Performance native** (pas de virtualisation)
- ✅ **PostgreSQL local** (pas de Docker)

### Workflow de développement

```bash
# Terminal 1 : Lancer l'API en mode watch
npm run dev:local

# Terminal 2 : Modifier le code
# Les changements sont automatiquement détectés et le serveur redémarre

# Terminal 3 : Tester
curl http://localhost:3000/health
```

### Outils disponibles

```bash
# Interface graphique pour la DB
npm run prisma:studio
```

---

## 🔄 Workflow de Développement

```
1. Lancer l'API en mode dev
   └─ npm run dev:local (hot-reload automatique)

2. Développer
   └─ Modifiez le code, sauvegardez, testez

3. Tester
   └─ curl/Postman pour vérifier les endpoints

4. Commit & Push
   └─ git commit -m ".." && git push
```

---

## ⚙️ Configuration

```env
# .env
DATABASE_URL="postgresql://scrappingscan:scrappingscan_password@localhost:5432/scrappingscan"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

---

## 🆘 Dépannage

### "Port 3000 déjà utilisé"

```bash
# Trouver le processus qui utilise le port
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### "Cannot connect to database"

```bash
# Vérifier que PostgreSQL tourne
pg_isready

# macOS : Redémarrer PostgreSQL
brew services restart postgresql@16

# Linux : Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

### "Prisma errors"

```bash
# Régénérer le client
npx prisma generate

# Appliquer les migrations
npm run prisma:migrate
```

---

## 💡 Astuces

### Garder les deux terminaux ouverts

```bash
# Terminal 1
npm run dev:local  # Laissez tourner

# Terminal 2
curl http://localhost:3000/health  # Testez
```

### Modifier le code

Éditez n'importe quel fichier `.ts`, sauvegardez, et le serveur redémarre automatiquement !

### Voir les logs en temps réel

```bash
npm run dev:local  # Les logs s'affichent directement
```

### Tester rapidement

```bash
# Health check
curl http://localhost:3000/health | jq

# Lister les mangas
curl http://localhost:3000/api/mangas/site/ANIME_SAMA | jq
```

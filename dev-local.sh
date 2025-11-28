#!/bin/bash

# Script pour démarrer en développement local

echo "🚀 Démarrage en mode développement local"
echo ""

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé"
    echo ""
    echo "Installation :"
    echo "  macOS    : brew install postgresql@16"
    echo "  Ubuntu   : sudo apt install postgresql"
    echo "  Windows  : https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
fi

# Vérifier si PostgreSQL tourne
if ! pg_isready -q; then
    echo "❌ PostgreSQL n'est pas démarré"
    echo ""
    echo "Démarrer PostgreSQL :"
    echo "  macOS    : brew services start postgresql@16"
    echo "  Linux    : sudo systemctl start postgresql"
    echo "  Windows  : Démarrer via Services"
    echo ""
    exit 1
fi

# Vérifier si la base existe
if ! psql -lqt | cut -d \| -f 1 | grep -qw scrappingscan; then
    echo "⚠️  Base de données 'scrappingscan' non trouvée"
    echo "Création de la base de données..."
    psql postgres -c "CREATE DATABASE scrappingscan;" 2>/dev/null || echo "Base déjà créée"
    psql postgres -c "CREATE USER scrappingscan WITH PASSWORD 'scrappingscan_password';" 2>/dev/null || echo "User déjà créé"
    psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE scrappingscan TO scrappingscan;" 2>/dev/null
fi

# Copier la config locale
echo "📝 Configuration de l'environnement local..."
cp .env.local .env

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Générer Prisma client
echo "🔧 Génération du client Prisma..."
npx prisma generate > /dev/null 2>&1

echo ""
echo "✅ Prêt à démarrer !"
echo ""
echo "Utilisez:"
echo "  npm run dev:local     - Mode watch (redémarre automatiquement)"
echo "  npm run start:local   - Mode production (build puis start)"
echo ""
echo "Services:"
echo "  API: http://localhost:3000 (à démarrer manuellement)"
echo "  PostgreSQL: localhost:5432 ✅"
echo "  Prisma Studio: npm run prisma:studio"
echo ""

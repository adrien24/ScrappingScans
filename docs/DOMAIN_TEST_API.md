# API de Test de Domaines - anime-sama

Cette API permet de tester les extensions de domaine avec le nom "anime-sama" jusqu'à trouver un domaine qui fonctionne.

## Endpoint

### Trouver un domaine qui fonctionne

**POST** `/api/domain-test/find-working`

Teste les extensions de domaine une par une jusqu'à trouver un domaine qui fonctionne. Dès qu'un domaine fonctionnel est trouvé :
- Il est enregistré en base de données
- Le processus s'arrête
- Les informations du domaine sont retournées

**Body (optionnel):**
```json
{
  "baseName": "anime-sama",    // Nom de base du domaine (défaut: "anime-sama")
  "timeout": 5000              // Timeout en ms pour chaque requête (défaut: 5000)
}
```

**Exemple avec curl:**
```bash
# Utiliser les valeurs par défaut
curl -X POST http://localhost:3000/api/domain-test/find-working \
  -H "Content-Type: application/json"

# Avec un timeout personnalisé
curl -X POST http://localhost:3000/api/domain-test/find-working \
  -H "Content-Type: application/json" \
  -d '{"baseName": "anime-sama", "timeout": 10000}'
```

**Réponse (immédiate):**
```json
{
  "message": "Domain search started in background",
  "totalExtensions": 1500,
  "baseName": "anime-sama",
  "note": "Check the database (DomainTests table) for the result"
}
```

> **Note:** La recherche s'exécute en arrière-plan pour éviter les timeouts. Le domaine trouvé sera automatiquement sauvegardé en base de données.

---

## Workflow

1. **Lancer la recherche:**
   ```bash
   curl -X POST http://localhost:3000/api/domain-test/find-working \
     -H "Content-Type: application/json"
   ```

2. **Le système va :**
   - Répondre immédiatement pour confirmer le démarrage
   - Tester chaque extension de domaine l'une après l'autre en arrière-plan
   - Afficher la progression tous les 50 domaines testés dans les logs
   - S'arrêter dès qu'un domaine fonctionne
   - Sauvegarder le domaine fonctionnel en base de données

3. **Vérifier si un domaine a été trouvé:**
   ```bash
   curl http://localhost:3000/api/domain-test/check
   ```

   **Réponse si trouvé:**
   ```json
   {
     "found": true,
     "domain": "anime-sama.tv",
     "extension": "tv",
     "statusCode": 200,
     "responseTime": 234,
     "foundAt": "2026-03-06T21:35:00.000Z"
   }
   ```

   **Réponse si pas encore trouvé:**
   ```json
   {
     "found": false,
     "message": "No working domain found yet"
   }
   ```

---

## Consulter le résultat en base de données

Une fois un domaine trouvé, vous pouvez le consulter avec Prisma Studio :

```bash
npx prisma studio
```

Ou via une requête SQL directe dans votre base de données PostgreSQL.

---

## Notes techniques

- Le test vérifie d'abord en HTTPS, puis en HTTP si HTTPS échoue
- Les tests sont effectués séquentiellement (un par un)
- Une progression est affichée tous les 50 domaines testés
- Le timeout par défaut est de 5 secondes par requête
- Le domaine trouvé est automatiquement stocké en base de données
- **Validation du domaine :**
  - Code HTTP 2xx ou 3xx
  - **ET** la balise `<title>` doit contenir exactement : `Anime-Sama - Streaming et catalogage d'animes et scans.`
- **Le processus s'arrête dès qu'un domaine fonctionnel est trouvé**

---

## Base de données

La table `DomainTests` contient :
- `domain`: Le domaine complet (ex: "anime-sama.tv")
- `extension`: L'extension TLD (ex: "tv")
- `isWorking`: Boolean indiquant si le domaine fonctionne
- `statusCode`: Code HTTP de la réponse
- `responseTime`: Temps de réponse en millisecondes
- `createdAt`: Date de création de l'entrée

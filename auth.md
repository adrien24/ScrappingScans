# Documentation API - Authentification Frontend

## Contexte

Le frontend dispose d'un systeme d'authentification complet avec :
- Pages : Login, Signup, Reset Password, Account
- Context React (`AuthProvider`) qui gere l'etat utilisateur + token JWT
- Routes protegees via `ProtectedRoute` (redirige vers `/login` si non authentifie)
- Stockage du token dans `localStorage` (`auth_token`)
- Un mode mock active via `VITE_MOCK_AUTH` pour dev sans backend

Le frontend attend un backend accessible via `VITE_BACKEND_URL`.

---

## Endpoints requis

### 1. `POST /api/auth/login`

Connexion d'un utilisateur existant.

**Request body :**
```json
{
  "email": "string",
  "password": "string"
}
```

**Validation frontend :**
- `email` : format email valide (requis)
- `password` : minimum 6 caracteres (requis)

**Response 200 :**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatarUrl": "string | null (optionnel)",
    "createdAt": "string (ISO 8601)"
  }
}
```

**Response erreur (401/400) :**
```json
{
  "message": "Email ou mot de passe invalide"
}
```

---

### 2. `POST /api/auth/register`

Inscription d'un nouvel utilisateur.

**Request body :**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Validation frontend :**
- `username` : minimum 3 caracteres (requis)
- `email` : format email valide (requis)
- `password` : minimum 6 caracteres (requis)
- `confirmPassword` est valide cote front uniquement (pas envoye au backend)

**Response 201 :**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatarUrl": "string | null (optionnel)",
    "createdAt": "string (ISO 8601)"
  }
}
```

**Response erreur (409/400) :**
```json
{
  "message": "Cet email est deja utilise"
}
```

---

### 3. `POST /api/auth/forgot-password`

Demande de reinitialisation de mot de passe.

**Request body :**
```json
{
  "email": "string"
}
```

**Response 200 :**
```json
{
  "message": "Un email de reinitialisation a ete envoye"
}
```

> Note : Retourner 200 meme si l'email n'existe pas (securite, eviter l'enumeration d'utilisateurs).

**Response erreur (500) :**
```json
{
  "message": "Erreur lors de l'envoi de l'email"
}
```

---

### 4. `GET /api/auth/me`

Recuperer l'utilisateur courant a partir du token JWT. Appele au chargement de l'app pour restaurer la session.

**Headers :**
```
Authorization: Bearer <token>
```

**Response 200 :**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatarUrl": "string | null (optionnel)",
  "createdAt": "string (ISO 8601)"
}
```

**Response erreur (401) :**
```json
{
  "message": "Non authentifie"
}
```

---

## Type User attendu

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string; // ISO 8601
}
```

---

## Flux d'authentification

1. **Login/Register** : le front recoit `{ token, user }`, stocke le token dans `localStorage` et redirige vers `/`
2. **Refresh au chargement** : le front lit `auth_token` dans `localStorage` et appelle `GET /api/auth/me` pour valider le token
3. **Logout** : purement cote client (suppression du token dans `localStorage`), pas d'appel backend
4. **Routes protegees** : toute page sauf `/login`, `/signup`, `/reset-password` necessite un token valide, sinon redirection vers `/login`

---

## Notes pour le backend

- Le token JWT doit contenir au minimum le `userId` pour que `/api/auth/me` puisse retrouver l'utilisateur
- Toutes les reponses d'erreur doivent avoir un champ `message` (string) - c'est ce qui est affiche a l'utilisateur via toast
- CORS : le backend doit autoriser les requetes depuis l'origin du frontend
- Le header `Content-Type: application/json` est envoye sur toutes les requetes
- Pas de refresh token pour l'instant - le front ne gere qu'un seul JWT

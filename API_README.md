# Baby-Foot Tournament API

API complète pour gérer des tournois de baby-foot avec authentification, gestion des équipes et génération automatique de matchs en round-robin.

## 🚀 Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000` (ou un autre port si 3000 est occupé).

## 📊 Base de données

La base de données SQLite est automatiquement créée dans `prisma/dev.db`.

### Créer un utilisateur admin

**Option 1 : Interface Web (Recommandé)**
1. Démarrez le serveur : `npm run dev`
2. Accédez à `http://localhost:3000/init-admin`
3. Créez le premier compte admin via le formulaire

**Option 2 : Prisma Studio**
```bash
# Ouvrir Prisma Studio
npx prisma studio

# Puis modifier le champ "role" d'un utilisateur de "USER" à "ADMIN"
```

**Option 3 : Via API**
```bash
curl -X POST http://localhost:3000/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","username":"admin","password":"password123"}'
```

📖 Pour plus de détails, consultez [ADMIN_SETUP.md](./ADMIN_SETUP.md)

## 🔐 Authentification

L'API utilise JWT stockés dans des cookies HTTP-only pour l'authentification.

### POST /api/auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "USER",
    "createdAt": "..."
  }
}
```

### POST /api/auth/login
Se connecter et recevoir un token JWT.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "USER"
  }
}
```

### GET /api/auth/me
Obtenir les informations de l'utilisateur connecté.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "USER",
    "createdAt": "..."
  }
}
```

### POST /api/auth/logout
Se déconnecter (supprime le cookie).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 🏆 Tournois

### GET /api/tournaments
Lister tous les tournois (public).

**Response:**
```json
{
  "success": true,
  "tournaments": [
    {
      "id": "...",
      "name": "Tournoi d'été 2025",
      "description": "Grand tournoi annuel",
      "date": "2025-07-15T14:00:00.000Z",
      "status": "UPCOMING",
      "createdBy": {
        "id": "...",
        "username": "admin",
        "email": "admin@example.com"
      },
      "_count": {
        "teams": 8,
        "matches": 28
      }
    }
  ]
}
```

### POST /api/tournaments
Créer un nouveau tournoi (admin uniquement).

**Body:**
```json
{
  "name": "Tournoi d'été 2025",
  "description": "Grand tournoi annuel",
  "date": "2025-07-15T14:00:00.000Z"
}
```

### GET /api/tournaments/[id]
Obtenir les détails d'un tournoi avec ses équipes et matchs (public).

**Response:**
```json
{
  "success": true,
  "tournament": {
    "id": "...",
    "name": "Tournoi d'été 2025",
    "teams": [...],
    "matches": [...]
  }
}
```

### PUT /api/tournaments/[id]
Modifier un tournoi (admin uniquement).

**Body:**
```json
{
  "name": "Nouveau nom",
  "status": "IN_PROGRESS"
}
```

### DELETE /api/tournaments/[id]
Supprimer un tournoi (admin uniquement, supprime aussi les équipes et matchs en cascade).

## 👥 Équipes

### GET /api/tournaments/[id]/teams
Lister les équipes d'un tournoi (public).

### POST /api/tournaments/[id]/teams
Ajouter une équipe à un tournoi (admin uniquement).

**Body:**
```json
{
  "name": "Les Warriors",
  "player1Name": "Alice",
  "player2Name": "Bob"
}
```

### PUT /api/teams/[id]
Modifier une équipe (admin uniquement).

**Body:**
```json
{
  "name": "Les Champions",
  "player1Name": "Alice",
  "player2Name": "Charlie"
}
```

### DELETE /api/teams/[id]
Supprimer une équipe (admin uniquement).

## ⚽ Matchs

### POST /api/tournaments/[id]/matches/generate
Générer automatiquement tous les matchs en round-robin (admin uniquement).

Chaque équipe jouera contre toutes les autres équipes exactement une fois. Les matchs sont numérotés chronologiquement (1, 2, 3, ...).

**Exemples:**
- 2 équipes → 1 match
- 4 équipes → 6 matchs
- 8 équipes → 28 matchs

**Response:**
```json
{
  "success": true,
  "matchesCreated": 28,
  "message": "Generated 28 matches"
}
```

**Erreurs:**
- 400: Moins de 2 équipes dans le tournoi
- 409: Des matchs existent déjà pour ce tournoi

### GET /api/tournaments/[id]/matches
Lister tous les matchs d'un tournoi (public).

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "id": "...",
      "matchNumber": 1,
      "homeScore": 10,
      "awayScore": 7,
      "status": "COMPLETED",
      "homeTeam": {
        "id": "...",
        "name": "Les Warriors",
        "player1Name": "Alice",
        "player2Name": "Bob"
      },
      "awayTeam": {
        "id": "...",
        "name": "Les Champions",
        "player1Name": "Charlie",
        "player2Name": "David"
      }
    }
  ]
}
```

### GET /api/matches/[id]
Obtenir les détails d'un match (public).

### PUT /api/matches/[id]
Mettre à jour le score ou le statut d'un match (admin uniquement).

**Body:**
```json
{
  "homeScore": 10,
  "awayScore": 7,
  "status": "COMPLETED"
}
```

**Statuts disponibles:**
- `UPCOMING`: À venir
- `IN_PROGRESS`: En cours
- `COMPLETED`: Terminé

## 🔒 Autorisation

- **Routes publiques:** Tous les GET endpoints (consultation)
- **Routes admin:** Tous les POST, PUT, DELETE (création, modification, suppression)

## 📝 Statuts

### Tournoi
- `UPCOMING`: À venir
- `IN_PROGRESS`: En cours
- `COMPLETED`: Terminé
- `CANCELLED`: Annulé

### Match
- `UPCOMING`: À venir
- `IN_PROGRESS`: En cours
- `COMPLETED`: Terminé

## 🛠️ Développement

### Prisma Studio
Pour gérer la base de données visuellement :

```bash
npx prisma studio
```

### Réinitialiser la base de données

```bash
npx prisma migrate reset
```

### Voir les migrations

```bash
npx prisma migrate status
```

## 📦 Technologies

- **Nuxt 4.2.2** - Framework Vue.js
- **Nitro** - Serveur backend
- **Prisma 7** - ORM
- **SQLite** - Base de données
- **bcrypt** - Hashage de mots de passe
- **JWT** - Authentification
- **Zod** - Validation des données

## 🧪 Exemple de workflow complet

1. **Créer un compte admin**
```bash
POST /api/auth/register
# Puis modifier le role en "ADMIN" dans Prisma Studio
```

2. **Se connecter**
```bash
POST /api/auth/login
```

3. **Créer un tournoi**
```bash
POST /api/tournaments
```

4. **Ajouter des équipes** (minimum 2)
```bash
POST /api/tournaments/[id]/teams
```

5. **Générer les matchs automatiquement**
```bash
POST /api/tournaments/[id]/matches/generate
```

6. **Mettre à jour les scores des matchs**
```bash
PUT /api/matches/[id]
```

7. **Consulter le tournoi**
```bash
GET /api/tournaments/[id]
```

## 🐛 Dépannage

Si le serveur ne démarre pas :
- Vérifier que le port 3000 est disponible
- Supprimer `node_modules` et `package-lock.json` puis `npm install`
- Vérifier que `.env` contient `DATABASE_URL="file:./dev.db"`

Si Prisma ne fonctionne pas :
- `npx prisma generate` pour régénérer le client
- `npx prisma migrate dev` pour appliquer les migrations

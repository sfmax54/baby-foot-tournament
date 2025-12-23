# Guide de Configuration Administrateur

## 🔐 Comment créer un compte administrateur

Il existe **3 méthodes** pour créer un compte administrateur:

---

## Méthode 1: Interface Web (Recommandée pour le premier admin)

### Étape par étape:

1. **Démarrez le serveur**:
```bash
npm run dev
```

2. **Accédez à la page d'initialisation**:
   - Ouvrez votre navigateur sur: `http://localhost:3000/init-admin`
   - Ou cliquez sur le lien "Initialize Admin" sur la page de login

3. **Remplissez le formulaire**:
   - Username (minimum 3 caractères)
   - Email (format email valide)
   - Password (minimum 8 caractères)
   - Confirm Password

4. **Créez le compte**:
   - Cliquez sur "Create Admin Account"
   - Si c'est le premier admin, le compte sera créé avec le rôle ADMIN
   - Vous serez redirigé vers la page de login

5. **Connectez-vous**:
   - Utilisez vos identifiants pour vous connecter
   - Vous aurez accès aux fonctionnalités admin

### ⚠️ Important:
- Cette méthode ne fonctionne que **si aucun admin n'existe déjà**
- Après la création du premier admin, utilisez la Méthode 2 ou 3

---

## Méthode 2: Via Prisma Studio (Pour promouvoir des utilisateurs existants)

### Étape par étape:

1. **Créez d'abord un compte utilisateur normal**:
   - Allez sur `http://localhost:3000/register`
   - Inscrivez-vous normalement

2. **Ouvrez Prisma Studio**:
```bash
npx prisma studio
```

3. **Modifiez le rôle**:
   - Prisma Studio s'ouvrira dans votre navigateur (généralement `http://localhost:5555`)
   - Cliquez sur la table **"users"** dans la sidebar
   - Trouvez votre utilisateur dans la liste
   - Cliquez sur le champ **"role"**
   - Changez la valeur de `"USER"` à `"ADMIN"`
   - Cliquez sur **"Save 1 change"**

4. **Reconnectez-vous**:
   - Déconnectez-vous de l'application (`/logout`)
   - Reconnectez-vous avec vos identifiants
   - Vous aurez maintenant les privilèges admin

### Avantages:
- ✅ Peut promouvoir n'importe quel utilisateur existant
- ✅ Interface visuelle simple
- ✅ Pas de code nécessaire

---

## Méthode 3: Via API directement (Pour les développeurs)

### Avec curl:

```bash
curl -X POST http://localhost:3000/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "username": "admin",
    "password": "your-secure-password"
  }'
```

### Avec un client HTTP (Postman, Insomnia, etc.):

**Endpoint**: `POST http://localhost:3000/api/auth/init-admin`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "admin@example.com",
  "username": "admin",
  "password": "your-secure-password"
}
```

**Response** (succès):
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "username": "admin",
    "role": "ADMIN",
    "createdAt": "..."
  }
}
```

**Response** (admin déjà existant):
```json
{
  "statusCode": 409,
  "message": "An admin user already exists. Use Prisma Studio to promote users."
}
```

---

## 🎯 Fonctionnalités Admin vs User

### Administrateur (ADMIN)
- ✅ Créer des tournois
- ✅ Modifier/Supprimer des tournois
- ✅ Ajouter des équipes manuellement
- ✅ Supprimer des équipes
- ✅ Générer les matchs automatiquement
- ✅ Mettre à jour les scores
- ✅ Changer le statut des matchs
- ✅ Voir toutes les fonctionnalités

### Utilisateur (USER)
- ✅ Parcourir les tournois
- ✅ Rejoindre des tournois avec un partenaire
- ✅ Voir les équipes et matchs
- ❌ Ne peut pas créer de tournois
- ❌ Ne peut pas modifier les scores
- ❌ Ne peut pas générer les matchs

---

## 🔒 Sécurité

### En développement:
- L'endpoint `/api/auth/init-admin` est accessible sans restriction
- C'est normal pour faciliter le développement

### En production (TODO):
Il est recommandé de:

1. **Désactiver l'endpoint** après avoir créé le premier admin:
```typescript
// server/api/auth/init-admin.post.ts
export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    throw createError({
      statusCode: 403,
      message: 'This endpoint is disabled in production'
    })
  }
  // ... reste du code
})
```

2. **Ou ajouter un secret token**:
```typescript
export default defineEventHandler(async (event) => {
  const { secret } = await readBody(event)

  if (secret !== process.env.ADMIN_INIT_SECRET) {
    throw createError({
      statusCode: 403,
      message: 'Unauthorized'
    })
  }
  // ... reste du code
})
```

Et définir dans `.env`:
```
ADMIN_INIT_SECRET=your-super-secret-token-here
```

---

## 📝 Vérifier le rôle d'un utilisateur

### Via Prisma Studio:
1. Ouvrez `npx prisma studio`
2. Cliquez sur la table "users"
3. Regardez la colonne "role"

### Via l'interface:
- Les admins voient un badge **"ADMIN"** à côté de leur nom dans la navigation
- Les admins voient des boutons/menus supplémentaires:
  - "Create Tournament" dans la navigation
  - "Create Tournament" sur la page d'accueil
  - Boutons d'édition/suppression dans les tournois

### Via la base de données directement:
```bash
sqlite3 dev.db "SELECT id, username, email, role FROM users;"
```

---

## 🆘 Dépannage

### "An admin user already exists"
- Un admin a déjà été créé
- Utilisez Prisma Studio pour promouvoir d'autres utilisateurs
- Ou connectez-vous avec le compte admin existant

### "User with this email or username already exists"
- Ce compte existe déjà
- Essayez avec un autre email/username
- Ou utilisez Prisma Studio pour promouvoir ce compte

### Je ne vois pas les fonctionnalités admin après connexion
- Déconnectez-vous complètement
- Videz le cache du navigateur
- Reconnectez-vous
- Vérifiez le rôle dans Prisma Studio

### L'endpoint /init-admin ne répond pas
- Vérifiez que le serveur tourne (`npm run dev`)
- Vérifiez l'URL: `http://localhost:3000/api/auth/init-admin`
- Regardez les logs du serveur pour les erreurs

---

## 📚 Liens utiles

- **Interface d'initialisation**: `/init-admin`
- **Page de login**: `/login`
- **Page d'inscription**: `/register`
- **Prisma Studio**: Exécutez `npx prisma studio`
- **Documentation**: [FRONTEND_README.md](./FRONTEND_README.md)

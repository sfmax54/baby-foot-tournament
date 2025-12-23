# Docker Deployment Guide

Ce guide explique comment déployer l'application de gestion de tournois de baby-foot avec Docker.

## Prérequis

- Docker installé (version 20.10+)
- Docker Compose installé (version 2.0+)

## Démarrage rapide

### Option 1: Avec Docker Compose (Recommandé)

```bash
# Lancer l'application
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Option 2: Avec Docker seul

```bash
# Construire l'image
docker build -t baby-foot-tournament .

# Lancer le conteneur
docker run -d \
  --name baby-foot-tournament \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET=your-secret-key \
  baby-foot-tournament

# Voir les logs
docker logs -f baby-foot-tournament

# Arrêter le conteneur
docker stop baby-foot-tournament

# Supprimer le conteneur
docker rm baby-foot-tournament
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet:

```env
JWT_SECRET=votre-clé-secrète-très-longue-et-sécurisée
NODE_ENV=production
DATABASE_URL=file:/app/data/dev.db
```

**Important**: Changez `JWT_SECRET` en production avec une valeur sécurisée!

### Génération d'un JWT_SECRET sécurisé

```bash
# Linux/macOS
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Persistence des données

Les données de la base de données SQLite sont stockées dans un volume Docker:

- **docker-compose.yml**: Le dossier `./data` sur l'hôte est monté dans `/app/data` du conteneur
- Les données survivent aux redémarrages du conteneur
- Pour sauvegarder: copiez simplement le dossier `./data`

## Commandes utiles

### Voir les logs

```bash
# Tous les logs
docker-compose logs

# Logs en temps réel
docker-compose logs -f

# Dernières 100 lignes
docker-compose logs --tail=100
```

### Redémarrer l'application

```bash
docker-compose restart
```

### Reconstruire l'image

```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Reconstruire et relancer
docker-compose up -d --build
```

### Accéder au shell du conteneur

```bash
docker-compose exec app sh
```

### Réinitialiser la base de données

```bash
# Arrêter le conteneur
docker-compose down

# Supprimer les données
rm -rf ./data

# Relancer
docker-compose up -d
```

### Exécuter les migrations manuellement

```bash
docker-compose exec app npx prisma migrate deploy
```

## Health Check

L'application inclut un health check qui vérifie:
- Que le serveur HTTP répond
- Que l'endpoint `/api/health` retourne 200

Vérifier le statut:
```bash
docker-compose ps
```

## Production

### Recommandations pour la production

1. **Variables d'environnement sécurisées**:
   ```bash
   # Générer un JWT_SECRET fort
   export JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Reverse Proxy (Nginx/Traefik)**:
   - Utilisez un reverse proxy pour HTTPS
   - Exemple avec Nginx:
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

3. **Sauvegardes régulières**:
   ```bash
   # Script de sauvegarde
   tar -czf backup-$(date +%Y%m%d).tar.gz ./data
   ```

4. **Monitoring**:
   ```bash
   # Surveiller l'utilisation des ressources
   docker stats baby-foot-tournament
   ```

5. **Limites de ressources**:
   Ajoutez dans `docker-compose.yml`:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
           reservations:
             cpus: '0.5'
             memory: 256M
   ```

## Dépannage

### Le conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs app

# Vérifier que le port 3000 n'est pas déjà utilisé
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/macOS
```

### Erreur de migration de base de données

```bash
# Réinitialiser les migrations
docker-compose down
rm -rf ./data
docker-compose up -d
```

### Problème de permissions

```bash
# Linux: donner les bonnes permissions au dossier data
sudo chown -R 1000:1000 ./data
```

## Architecture du Dockerfile

Le Dockerfile utilise une construction multi-stage:

1. **Stage 1 (builder)**:
   - Installe toutes les dépendances
   - Génère le client Prisma
   - Build l'application Nuxt

2. **Stage 2 (production)**:
   - Image légère avec uniquement les dépendances de production
   - Copie uniquement les fichiers nécessaires
   - Configure l'environnement de production

Taille de l'image finale: ~200-300 MB

## Support

Pour plus d'informations, consultez:
- [Documentation Nuxt](https://nuxt.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation Docker](https://docs.docker.com)

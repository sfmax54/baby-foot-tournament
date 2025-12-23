# 🏓 Baby-Foot Tournament Manager

Application de gestion de tournois de baby-foot (foosball) construite avec Nuxt 3, Prisma et SQLite.

## ✨ Fonctionnalités

### Gestion des tournois
- ✅ Création et gestion de tournois
- ✅ Système de rôles (Admin/Utilisateur)
- ✅ Inscription d'équipes par les joueurs
- ✅ Ajout d'équipes invitées par les admins
- ✅ Génération automatique des matchs en round-robin
- ✅ Verrouillage des inscriptions après génération des matchs
- ✅ Réinitialisation des matchs pour rouvrir les inscriptions

### Matchs et scores
- ✅ Système de scoring en temps réel
- ✅ Validation: match terminé uniquement si une équipe atteint 10 buts
- ✅ Incrémentation/décrémentation des scores avec la molette de souris
- ✅ Mise à jour des statuts de match (À venir, En cours, Terminé)
- ✅ Calcul automatique du statut du tournoi

### Interface utilisateur
- ✅ Design responsive avec Tailwind CSS
- ✅ Célébration visuelle à la fin d'un tournoi
- ✅ Classement en temps réel basé sur les victoires et différence de buts
- ✅ Bannière de célébration dismissible
- ✅ Indicateurs visuels pour les vainqueurs

### Sécurité
- ✅ Authentification JWT avec cookies HTTP-only
- ✅ Hashing des mots de passe avec bcrypt
- ✅ Middleware d'authentification
- ✅ Contrôle d'accès basé sur les rôles
- ✅ Configuration du premier admin obligatoire

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+ installé
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <votre-repo>
cd baby2

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Générer le client Prisma et créer la base de données
npx prisma migrate dev

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Premier démarrage

1. Au premier lancement, vous serez redirigé vers `/init-admin`
2. Créez le premier compte administrateur
3. Vous pourrez ensuite créer des tournois et gérer l'application

## 🐳 Déploiement avec Docker

Pour déployer l'application avec Docker, consultez le guide détaillé : [DOCKER.md](DOCKER.md)

### Démarrage rapide avec Docker Compose

```bash
# Lancer l'application
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📝 Scripts disponibles

### Développement
```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build pour la production
npm run preview      # Prévisualiser le build de production
```

### Tests
```bash
npm test             # Tests unitaires avec Vitest
npm run test:ui      # Interface UI pour les tests
npm run test:run     # Run tests une fois
npm run test:coverage # Coverage des tests
```

### Tests E2E
```bash
npm run test:e2e         # Tests E2E avec Playwright
npm run test:e2e:ui      # Interface UI Playwright
npm run test:e2e:headed  # Tests avec navigateur visible
npm run test:e2e:debug   # Mode debug Playwright
```

Voir [e2e/README.md](e2e/README.md) pour plus de détails sur les tests E2E.

### Base de données
```bash
npm run db:reset     # Réinitialiser la base de données
npm run db:clean     # Nettoyer la base de données
npx prisma studio    # Interface graphique pour la BDD
```

## 🏗️ Architecture

```
baby2/
├── app/                    # Code frontend Nuxt
│   ├── pages/             # Pages de l'application
│   ├── components/        # Composants Vue (si utilisés)
│   └── composables/       # Composables Vue
├── server/                # Code backend
│   ├── api/              # Endpoints API
│   ├── middleware/       # Middleware serveur
│   └── utils/            # Utilitaires serveur
├── prisma/               # Schema et migrations Prisma
├── tests/                # Tests unitaires
├── e2e/                  # Tests end-to-end
└── public/               # Assets statiques
```

## 🛠️ Technologies

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3)
- **Database**: SQLite avec [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: JWT + bcrypt
- **Testing**:
  - Unit: [Vitest](https://vitest.dev/)
  - E2E: [Playwright](https://playwright.dev/)
- **Containerization**: Docker

## 📊 Statistiques

- **94 tests unitaires** passants
- **Couverture de code** complète sur l'API
- **Tests E2E** pour les flux utilisateurs principaux
- **Architecture** scalable et maintenable

## 🔐 Sécurité

- Tokens JWT stockés dans des cookies HTTP-only
- Mots de passe hashés avec bcrypt (10 rounds)
- Validation des données avec Zod
- Protection CSRF via cookies SameSite
- Middleware d'authentification sur toutes les routes API privées

## 📖 Documentation

- [Guide de déploiement Docker](DOCKER.md)
- [Documentation des tests E2E](e2e/README.md)
- [API Documentation](API_README.md)

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🎯 Roadmap

- [ ] Système de notifications en temps réel
- [ ] Export des résultats en PDF
- [ ] Statistiques avancées des joueurs
- [ ] Support multi-langue
- [ ] Mode tournoi à élimination directe
- [ ] Intégration avec des services de calendrier

## 👥 Auteurs

Développé avec ❤️ pour les passionnés de baby-foot!

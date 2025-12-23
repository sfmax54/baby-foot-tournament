# Tests E2E avec Playwright

Ce dossier contient les tests end-to-end (E2E) pour l'application de gestion de tournois de baby-foot.

## Prérequis

- Node.js installé
- Dépendances installées (`npm install`)
- Navigateur Chromium installé (`npx playwright install chromium`)

## Lancer les tests

### Option 1: Avec serveur automatique (recommandé en CI)

```bash
npm run test:e2e
```

Cette commande démarre automatiquement le serveur Nuxt, lance les tests, puis arrête le serveur.

### Option 2: Avec serveur manuel (recommandé en développement)

1. Démarrer le serveur de développement dans un terminal:
```bash
npm run dev
```

2. Dans un autre terminal, lancer les tests:
```bash
npm run test:e2e
```

### Autres commandes utiles

- **Mode UI interactif**: `npm run test:e2e:ui`
- **Mode headed (voir le navigateur)**: `npm run test:e2e:headed`
- **Mode debug**: `npm run test:e2e:debug`

## Structure des tests

- `fixtures.ts` - Configuration commune et nettoyage de la base de données
- `admin-setup.spec.ts` - Tests du flux de création du premier admin
- `tournament-management.spec.ts` - Tests de création et gestion des tournois
- `match-scoring.spec.ts` - Tests de scoring des matchs et célébrations

## Fonctionnalités testées

### Admin Setup Flow
- ✅ Redirection automatique vers /init-admin quand aucun admin n'existe
- ✅ Création du premier compte admin
- ✅ Blocage de l'accès à /init-admin après création de l'admin
- ✅ Validation des mots de passe

### Tournament Management
- ✅ Création de tournoi par un admin
- ✅ Blocage de création pour les utilisateurs normaux
- ✅ Ajout d'équipes au tournoi
- ✅ Génération de matchs en round-robin
- ✅ Verrouillage des inscriptions après génération des matchs
- ✅ Réinitialisation des matchs pour rouvrir les inscriptions

### Match Scoring
- ✅ Mise à jour des scores
- ✅ Validation: impossibilité de compléter un match sans vainqueur (10 buts)
- ✅ Validation: acceptation quand une équipe atteint 10 buts
- ✅ Incrémentation/décrémentation des scores avec la molette de souris
- ✅ Limitation des scores entre 0 et 10
- ✅ Affichage de la célébration quand tous les matchs sont terminés
- ✅ Fermeture de la bannière de célébration
- ✅ Affichage du classement final

## Notes importantes

- Les tests réinitialisent la base de données avant chaque test
- Les tests s'exécutent séquentiellement (workers: 1) pour éviter les conflits de base de données
- Les captures d'écran sont prises uniquement en cas d'échec
- Les traces sont enregistrées uniquement lors du premier retry

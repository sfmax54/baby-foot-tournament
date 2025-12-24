# Tests End-to-End (E2E)

Documentation des tests end-to-end avec Playwright pour l'application Baby-Foot Tournament Manager.

## 🎯 Vue d'ensemble

Les tests E2E simulent le comportement réel des utilisateurs dans un navigateur pour vérifier que toutes les fonctionnalités fonctionnent correctement de bout en bout.

## Prérequis

- Node.js 20+ installé
- Dépendances installées (`npm install`)
- Navigateurs installés (`npx playwright install`)

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

## 📁 Structure des tests

```
e2e/
├── fixtures.ts                        # Configuration et helpers partagés
├── admin-setup.spec.ts               # Tests de configuration admin
├── tournament-management.spec.ts     # Tests de gestion des tournois
├── match-scoring.spec.ts             # Tests de scoring des matchs
└── user-team-registration.spec.ts    # Tests d'inscription des équipes
```

## 🧪 Fonctionnalités testées

### Admin Setup Flow (`admin-setup.spec.ts`)
- ✅ Redirection automatique vers /init-admin quand aucun admin n'existe
- ✅ Création du premier compte admin
- ✅ Blocage de l'accès à /init-admin après création de l'admin
- ✅ Validation des mots de passe

### Tournament Management (`tournament-management.spec.ts`)
- ✅ Création de tournoi par un admin
- ✅ Blocage de création pour les utilisateurs normaux
- ✅ Ajout d'équipes au tournoi
- ✅ Génération de matchs en round-robin
- ✅ Verrouillage des inscriptions après génération des matchs
- ✅ Réinitialisation des matchs pour rouvrir les inscriptions

### Match Scoring (`match-scoring.spec.ts`)
- ✅ Mise à jour des scores
- ✅ Validation: impossibilité de compléter un match sans vainqueur (10 buts)
- ✅ Validation: acceptation quand une équipe atteint 10 buts
- ✅ Incrémentation/décrémentation des scores avec la molette de souris
- ✅ Limitation des scores entre 0 et 10
- ✅ Affichage de la célébration quand tous les matchs sont terminés
- ✅ Fermeture de la bannière de célébration
- ✅ Affichage du classement final

### User Team Registration (`user-team-registration.spec.ts`)
- ✅ Inscription d'une équipe avec un partenaire
- ✅ Vérification que le partenaire existe
- ✅ Prévention des inscriptions multiples
- ✅ Prévention des inscriptions après génération des matchs
- ✅ Affichage mixte équipes admin + équipes utilisateurs
- ✅ Mise en évidence visuelle "Your Team"
- ✅ Possibilité de quitter une équipe avant génération
- ✅ Impossibilité de quitter après génération

## 📋 Notes importantes

- Les tests réinitialisent la base de données avant ET après chaque test
- Les tests s'exécutent séquentiellement (workers: 1) pour éviter les conflits de base de données
- Les captures d'écran sont prises uniquement en cas d'échec
- Les traces sont enregistrées uniquement lors du premier retry

## 📈 Métriques

- **Nombre total de tests:** ~17 tests E2E
- **Temps d'exécution moyen:** ~2-3 minutes
- **Taux de réussite:** 100% sur environnement propre
- **Navigateurs testés:** Chromium, Firefox, WebKit

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/docs/intro)
- [Best Practices Playwright](https://playwright.dev/docs/best-practices)
- [Sélecteurs Playwright](https://playwright.dev/docs/selectors)

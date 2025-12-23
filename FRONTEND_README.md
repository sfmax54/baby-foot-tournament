# Baby-Foot Tournament Manager - Frontend Guide

## 🎯 Vue d'ensemble

Application web complète pour gérer des tournois de baby-foot avec génération automatique de matchs en mode round-robin.

## 🚀 Fonctionnalités principales

### Pour les Administrateurs

#### 1. **Créer des tournois**
- Accès via `/tournaments/new` ou bouton "Create Tournament"
- Champs requis :
  - Nom du tournoi
  - Date et heure
  - Description (optionnel)

#### 2. **Gérer les équipes**
- Ajouter des équipes manuellement avec des noms de joueurs invités
- Voir toutes les équipes inscrites (utilisateurs enregistrés + invités)
- Supprimer des équipes si nécessaire

#### 3. **Générer les matchs automatiquement**
- Bouton "Generate Round-Robin Matches" disponible quand :
  - Au moins 2 équipes sont inscrites
  - Aucun match n'a encore été généré
- Le système calcule automatiquement le nombre de matchs : `n(n-1)/2`
- Exemples :
  - 4 équipes → 6 matchs
  - 6 équipes → 15 matchs
  - 8 équipes → 28 matchs

#### 4. **Mettre à jour les résultats**
- Modifier les scores des matchs
- Changer le statut : UPCOMING → IN_PROGRESS → COMPLETED

### Pour les Utilisateurs

#### 1. **Parcourir les tournois disponibles**
- Page `/join` pour voir tous les tournois ouverts
- Filtrage automatique : seuls les tournois avec statut "UPCOMING"

#### 2. **Rejoindre un tournoi**
- Créer une équipe avec un partenaire
- Le partenaire doit avoir un compte sur la plateforme
- Champs requis :
  - Nom de l'équipe
  - Email du partenaire

#### 3. **Voir ses inscriptions**
- Badge "✓ You're registered!" sur les tournois rejoints
- Affichage du nom de l'équipe

## 🎯 Règles du Baby-Foot

### Score de victoire
**Le premier à atteindre 10 buts remporte le match!**

- Score maximum: **10 buts**
- Pas de nul possible (match joué jusqu'à ce qu'une équipe atteigne 10)
- Système de points: Victoire = 3 pts, Nul = 1 pt, Défaite = 0 pt

### Indicateurs visuels
- 🏆 **Trophée** affiché à côté de l'équipe gagnante (10 buts)
- Score du gagnant en **vert**
- Message "Winner!" dans le formulaire d'édition
- Bordure verte sur le champ du score gagnant

## 📊 Algorithme Round-Robin

### Principe
Chaque équipe joue contre toutes les autres équipes **exactement une fois**.

### Formule
```
Nombre de matchs = n × (n - 1) ÷ 2
```
où `n` = nombre d'équipes

### Exemple avec 4 équipes
```
Équipes : A, B, C, D

Match 1: A vs B
Match 2: A vs C
Match 3: A vs D
Match 4: B vs C
Match 5: B vs D
Match 6: C vs D

Résultat : 6 matchs au total
Chaque équipe joue 3 matchs
```

## 🎨 Structure des pages

### Pages publiques
- `/` - Page d'accueil avec CTA adaptés (admin/user)
- `/login` - Connexion
- `/register` - Inscription
- `/how-it-works` - Documentation du système round-robin

### Pages authentifiées
- `/tournaments` - Liste de tous les tournois
- `/tournaments/:id` - Détails d'un tournoi avec onglets Teams/Matches
- `/join` - Rejoindre un tournoi (utilisateurs uniquement)
- `/tournaments/new` - Créer un tournoi (admins uniquement)

## 🔐 Gestion des rôles

### Admin
- Créer des tournois
- Ajouter/supprimer des équipes
- Générer les matchs
- Mettre à jour les scores
- Navigation : "Create Tournament"

### User
- Rejoindre des tournois
- Voir les tournois et matchs
- Navigation : "Join Tournament" (en surbrillance)

## 💾 Modèle de données

### Teams (Équipes)
Deux types d'équipes possibles :

#### 1. Équipes avec utilisateurs enregistrés
```typescript
{
  id: string
  name: string
  members: [
    { user: { id, username, email } },
    { user: { id, username, email } }
  ]
}
```

#### 2. Équipes avec joueurs invités
```typescript
{
  id: string
  name: string
  player1Name: string
  player2Name: string
}
```

### Matches
```typescript
{
  id: string
  matchNumber: number  // Ordre chronologique
  homeTeam: Team
  awayTeam: Team
  homeScore: number | null
  awayScore: number | null
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED"
}
```

## 🎯 Interface utilisateur

### Bouton de génération de matchs

#### Dans l'onglet Teams
- Apparaît sous la liste des équipes
- Affiche le nombre de matchs qui seront créés
- Style : Bouton primaire large avec emoji ⚡

#### Dans l'onglet Matches
- Section centrale avec explication du système
- Calcul en temps réel du nombre de matchs
- Message d'avertissement si moins de 2 équipes

### Affichage des matchs générés

#### Badge informatif
```
✅ Round-Robin Schedule Generated
All X teams will play against each other exactly once
for a total of Y matches. Each team will play Z matches.
```

#### Liste des matchs
- Carte par match avec :
  - Numéro du match
  - Noms des équipes (avec joueurs)
  - Score (ou `-` si non joué)
  - Badge de statut
  - Bouton "Edit" pour les admins

## 🎨 Design

### Palette de couleurs
- **Primary** : Bleu (#0ea5e9)
- **Success** : Vert pour les confirmations
- **Warning** : Jaune pour les avertissements
- **Danger** : Rouge pour les suppressions

### Composants réutilisables
- `.btn` - Boutons de base
- `.btn-primary` - Bouton d'action principale
- `.btn-secondary` - Bouton secondaire
- `.btn-danger` - Bouton de suppression
- `.card` - Carte avec ombre
- `.input` - Champ de formulaire

## 📱 Responsive

- Design mobile-first
- Grille adaptative (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Navigation responsive avec hamburger menu
- Footer adaptatif

## ⚡ Performance

### Auto-imports Nuxt
Tous les composables et utilitaires sont auto-importés :
- `useAuth()` - Gestion de l'authentification
- `useState()` - État global
- `$fetch()` - Requêtes API
- `navigateTo()` - Navigation

### Optimisations
- Lazy loading des pages
- État global avec `useState`
- Requêtes API optimisées avec includes Prisma

## 🚦 Flow utilisateur type

### Administrateur
1. Créer un compte et se faire promouvoir admin (via Prisma Studio)
2. Se connecter
3. Créer un tournoi
4. Ajouter des équipes ou attendre les inscriptions
5. Générer les matchs automatiquement
6. Mettre à jour les scores au fur et à mesure

### Utilisateur standard
1. Créer un compte
2. Se connecter
3. Parcourir les tournois disponibles (`/join`)
4. S'inscrire avec un partenaire
5. Consulter le planning des matchs
6. Suivre les résultats

## 🔧 API Endpoints utilisés

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

### Tournois
- `GET /api/tournaments` - Liste des tournois
- `GET /api/tournaments/available` - Tournois ouverts
- `GET /api/tournaments/:id` - Détails d'un tournoi
- `POST /api/tournaments` - Créer (admin)
- `PUT /api/tournaments/:id` - Modifier (admin)
- `DELETE /api/tournaments/:id` - Supprimer (admin)

### Équipes
- `GET /api/tournaments/:id/teams` - Équipes d'un tournoi
- `POST /api/tournaments/:id/teams` - Ajouter une équipe (admin)
- `POST /api/tournaments/:id/join` - Rejoindre (user)
- `DELETE /api/teams/:id` - Supprimer (admin)

### Matchs
- `GET /api/tournaments/:id/matches` - Matchs d'un tournoi
- `POST /api/tournaments/:id/matches/generate` - Générer (admin)
- `PUT /api/matches/:id` - Mettre à jour (admin)

## 🎓 En savoir plus

Consultez la page `/how-it-works` pour une explication détaillée du système round-robin avec des exemples visuels.

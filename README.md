# Tetris - Jeu en JavaScript avec Serveur Go

## Description

Ce projet est une implémentation du jeu **Tetris** en JavaScript en utilisant le DOM. Il suit les principes d'animation fluide avec `requestAnimationFrame` et propose une gestion optimisée du score, des vies et des interactions clavier.

Un serveur en **Go** est intégré pour gérer le stockage des scores et permettre une meilleure gestion des parties.

## Fonctionnalités

- **Gameplay classique de Tetris**
- **Animation fluide (60 FPS) sans drop de frame**
- **Gestion des scores via un serveur Go**
- **Classement des joueurs avec stockage des scores**
- **Effets sonores intégrés**
- **Gestion du temps et des niveaux**
- **Mode pause avec options Reprendre / Redémarrer**

## Structure du Projet

```
/tetris
│── index.html           # Page principale du jeu
│── scores.json          # Sauvegarde des scores (non utilisé si serveur Go actif)
│── main.go              # Serveur Go (point d'entrée)
│
├── static/css
│   ├── style.css        # Styles principaux
│
├── static/js
│   ├── globals.js       # Variables globales
│   ├── timer.js         # Gestion du temps
│   ├── game.js          # Logique du jeu
│   ├── background.js    # Gestion de l'arrière-plan
│   ├── sound.js         # Gestion des sons
│   ├── main.js          # Initialisation principale
│   ├── score.js         # Gestion des scores avec serveur Go
│   ├── map.js           # Gestion des cartes
│
├── map-creator          # Outil de création de cartes
│   ├── indext.html      # Interface de création de cartes
│   ├── script.js        # Logique de la création de cartes
│   ├── styles.css       # Styles pour l'outil
```

## Installation et Exécution

1. **Cloner le projet**

   ```sh
   git clone <URL_du_repo>
   cd tetris
   ```

2. **Lancer le serveur Go**

   ```sh
   go run main.go
   ```

3. **Ouvrir `index.html` dans un navigateur**
   - Fonctionne directement en local
   - Se connecte automatiquement au serveur pour gérer les scores

## Commandes et Contrôles

- `Flèche gauche/droite` : Déplacer les blocs
- `Flèche bas` : Accélérer la descente
- `Flèche haut` : Rotation des blocs
- `Espace` : Pause
- `Entrée` : Reprendre

## Améliorations Possibles

- Ajouter un mode multijoueur
- Améliorer l'IA pour ajuster la difficulté
- Ajouter une interface plus moderne avec animations CSS
- Sauvegarder les scores dans une base de données SQLite/PostgreSQL

## Auteurs

- **Zanakan** - Développeur principal

## Licence

Ce projet est sous licence MIT. Vous pouvez le modifier et l'améliorer librement.

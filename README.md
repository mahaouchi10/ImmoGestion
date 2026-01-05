# ImmoGestion - Backoffice Agence Immobilière

ImmoGestion est une application web de gestion immobilière (Backoffice) développée en HTML5, CSS3 (Tailwind CSS) et JavaScript (Vanilla). Elle permet la gestion complète des biens immobiliers, agents, clients, visites et contrats.

## Fonctionnalités principales

- Authentification statique (admin/admin)
- Tableau de bord avec statistiques
- CRUD complet pour :
  - Biens immobiliers
  - Agents
  - Clients
  - Visites
  - Contrats
- Tri, filtres, pagination sur chaque entité
- Export CSV des données affichées
- Modals stylisés pour l'ajout/édition
- Pop-up de confirmation pour la suppression
- Détail d'un bien avec export PDF
- Responsive design (Tailwind CSS)

## Structure du projet

```
index.html           # Dashboard principal
login.html           # Page de connexion
biens.html           # Gestion des biens immobiliers
agents.html          # Gestion des agents
clients.html         # Gestion des clients
visites.html         # Gestion des visites
contrats.html        # Gestion des contrats
details.html         # Détail d'un bien
biens.js             # Logique JS pour biens immobiliers
agents.js            # Logique JS pour agents
clients.js           # Logique JS pour clients
visites.js           # Logique JS pour visites
contrats.js          # Logique JS pour contrats
README.md            # Ce fichier
```

## Installation & Lancement

1. Clonez le dépôt ou copiez les fichiers dans un dossier local.
2. Ouvrez le dossier dans VS Code ou un éditeur de votre choix.
3. Lancez l'application en ouvrant `login.html` ou `index.html` dans votre navigateur.

Aucune dépendance serveur n'est requise (100% front-end, données simulées en JS).

## Technologies utilisées
- HTML5
- CSS3 (Tailwind CSS via CDN)
- JavaScript ES6+
- FontAwesome (icônes)
- jsPDF (export PDF)

## Auteur
- Réalisé par Abdellatif MAHAOUCHI 

## Licence
Ce projet est fourni à des fins pédagogiques et peut être adapté selon vos besoins.

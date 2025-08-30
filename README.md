# 🎶 FOG — Création d’ambiances sonores personnalisées

## 🌟 Présentation

**FOG** est une application web permettant de créer des ambiances sonores entièrement personnalisées et moins répétitives car contrairement aux solutions classiques (vidéos YouTube ou ambiances pré-enregistrées), FOG propose de rajouter de l'aléatoire et joue chaque son de manière individuelle donc l'ambiance ne se répète jamais.  
L’objectif principal est d’aider à la **concentration**, à la **relaxation mentale**, ou encore à l’**immersion créative** (ex. : jeux de rôle, vidéos, méditation, yoga).

Chaque utilisateur peut :

- Créer son ambiance sonore à partir d’une bibliothèque de sons et d'ambiances créées par les utilisateurs, en utilisant des filtres de recherche avancés.
- Ajuster précisément les paramètres de chaque son individuellement (volume, vitesse, spatialisation, réverbération, fréquence d'apparition du son…)
- Sauvegarder sons et ambiances et gérer ses préférences

**Cible :** indépendants, employés de bureau, créatifs, amateurs de méditation/yoga/massage, ou toute personne cherchant une ambiance sonore immersive.

## 🛠️ Technologies utilisées

- **Next.js** → framework fullstack pour le rendu SSR/SSG, les routes API et le déploiement sur Vercel
- **PostgreSQL (Pg)** → stockage structuré (utilisateurs, ambiances, sons...)
- **Supabase** → hébergement et gestion de la base de données
- **TypeScript** → typage statique pour la fiabilité et maintenance
- **Tailwind CSS** → UI moderne, responsive et rapide à prototyper
- **Tone.js** → gestion audio avancée
- **Zustand** → gestion d’état global simple et performante
- **Lucide React** → bibliothèque d’icônes SVG
- **Zod** → validation des entrées et sécurisation des API
- **Jest** → quelques tests unitaires
- **IndexedDB** → stockage local des sons (mp3) pour optimiser la bande passante
- **Sentry** → suivi et monitoring des erreurs en production

## 🔐 Sécurité

- Authentification sécurisée
- Prévention contre l'injection SQL, XSS, CSRF
- Content Security Policy, NoSniff headers
- Limitation des requêtes globales et par route
- Limitation des téléchargements
- Validation stricte des entrées utilisateur
- Ainsi que diverses autres protections

## 📈 Optimisation & Performance

- Optimisation des images (WebP, compression)
- Mise en cache des images
- Mise en cache des sons avec la indexed DB
- Réduction des requêtes réseau et mémoire (sons réutilisés localement)
- Compatibilité multi-navigateurs (harmonisation scrollbars, UI)
- Application responsive mobile & desktop

## 👁️ Accessibilité

- Application accessible visuellement et dans sa simplicité d'utilisation
- Bonnes pratiques SEO et accessibilité (sémantique, differents attributs aria)

## 📂 Organisation

- Documents de conception complets
- Architecture propre
- Scripts SQL pour les migrations
- Utilisation de GITHUB
- Liste de tâches complétées et en attente
- Méthode agile

## 🧪 Tests

- **Tests unitaires** (Quelques tests car pas eu le temps de m'y mettre sérieusement)
- Monitoring des erreurs avec **Sentry**

## 🌍 Déploiement

- Déployé sur **Vercel** (frontend + API + CI/CD simplifié)
- **Supabase** pour la base de données distante

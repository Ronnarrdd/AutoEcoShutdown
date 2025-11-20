# AutoEcoShutdown - Version Tauri

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![Tauri](https://img.shields.io/badge/Tauri-1.5-green)
![License](https://img.shields.io/badge/license-ISC-orange)

Une application élégante et intuitive pour gérer l'extinction automatique de votre ordinateur, avec des conseils d'économie d'énergie et un tableau de bord écologique montrant l'impact du gaspillage énergétique en temps réel.

**Version Tauri - Application ultra-légère construite avec Rust et Web Technologies**

![Screenshot de l'application](docs/screenshot.png)

## 🌟 Fonctionnalités

- ⏱️ Compte à rebours de 15 minutes avant l'extinction
- 💡 Conseils d'économie d'énergie avec illustrations
- 🎨 Interface moderne et élégante
- 🖥️ Application très légère grâce à Tauri
- ⚠️ Tableau de bord du gaspillage énergétique en temps réel
- 🌍 Calcul de l'impact écologique (CO₂, équivalence voiture/arbres)
- 📊 Monitoring de la consommation système réelle
- 🌙 Projection du gaspillage jusqu'au matin

## 🚀 Installation

### Prérequis

- [Rust](https://www.rust-lang.org/tools/install) (version 1.70 ou supérieure)
- [Node.js](https://nodejs.org/) (version 16 ou supérieure)

### Depuis les sources

1. Clonez le dépôt
2. Naviguez dans le dossier `tauri/`
3. Installez les dépendances :
   ```bash
   npm install
   ```
4. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```
5. Ou compilez l'application :
   ```bash
   npm run build
   ```

L'exécutable sera généré dans `src-tauri/target/release/`

## 🎯 Utilisation

- L'application s'ouvre avec un compte à rebours de 15 minutes
- Un message d'avertissement s'affiche à 4 minutes
- Cliquez sur "Je suis toujours là" pour annuler l'extinction

## 📦 Structure des fichiers

```
tauri/
├── src-tauri/
│   ├── src/
│   │   └── main.rs      # Backend Rust
│   ├── Cargo.toml       # Dépendances Rust
│   └── tauri.conf.json  # Configuration Tauri
├── assets/              # Images et ressources
├── index.html           # Interface utilisateur
└── package.json         # Configuration Node.js
```

## 🔧 Technologies utilisées

- **Tauri** : Framework d'application desktop moderne
- **Rust** : Backend performant et sécurisé
- **Chart.js** : Graphiques temps réel
- **sysinfo** : Informations système en Rust
- **chrono** : Gestion du temps en Rust

## 💪 Avantages de la version Tauri

- **Ultra-légère** : ~10 MB au lieu de ~150 MB pour Electron
- **Performance** : Backend en Rust natif
- **Sécurité** : Sandboxing et permissions granulaires
- **Mémoire** : Utilisation mémoire réduite de ~80%
- **Démarrage rapide** : Temps de lancement divisé par 2

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer une amélioration
- Soumettre une pull request

## 📝 Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Police Rimouski pour l'élégance typographique
- [Chart.js](https://www.chartjs.org/) pour les graphiques temps réel
- Tauri pour le framework d'application desktop ultra-léger
- sysinfo pour les données système réelles en Rust
- [Écologie stickers](https://www.flaticon.com/fr/stickers-gratuites/ecologie) créés par [paulalee](https://www.flaticon.com/fr/auteurs/paulalee) - [Flaticon](https://www.flaticon.com/fr/)

---

Développé avec ❤️ pour une meilleure gestion de l'énergie et la préservation de notre planète 🌍



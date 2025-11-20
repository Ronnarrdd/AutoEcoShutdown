# Guide de démarrage rapide - AutoEcoShutdown Tauri

## 🚀 Installation et lancement

### 1. Prérequis

Avant de commencer, assurez-vous d'avoir installé :

#### Rust (obligatoire)
```bash
# Windows (PowerShell)
# Téléchargez et installez depuis : https://rustup.rs/
# Ou utilisez cette commande :
winget install --id Rustlang.Rustup
```

#### Node.js (obligatoire)
```bash
# Windows
winget install --id OpenJS.NodeJS
```

### 2. Installation des dépendances

Ouvrez PowerShell dans le dossier `tauri/` et exécutez :

```bash
npm install
```

### 3. Lancer en mode développement

```bash
npm run dev
```

L'application se lancera automatiquement avec le hot-reload activé.

### 4. Compiler l'application

Pour créer un exécutable :

```bash
npm run build
```

L'exécutable sera disponible dans :
```
src-tauri/target/release/auto-eco-shutdown.exe
```

## 📝 Notes importantes

### Icônes
Pour générer les icônes de l'application, consultez le fichier `ICONS_GUIDE.md`.

### Permissions Windows
L'application nécessite les permissions pour :
- Lire les informations système (CPU, mémoire)
- Exécuter la commande d'extinction Windows

### Première compilation
La première compilation peut prendre 5-10 minutes car Rust compile toutes les dépendances.
Les compilations suivantes seront beaucoup plus rapides.

## 🐛 Dépannage

### Erreur "Rust not found"
Assurez-vous que Rust est installé et redémarrez votre terminal.

### Erreur de compilation Rust
Mettez à jour Rust :
```bash
rustup update
```

### Erreur "WebView2 not found"
Sur Windows, Tauri nécessite WebView2. Il est normalement préinstallé sur Windows 10/11.
Sinon, téléchargez-le depuis : https://developer.microsoft.com/microsoft-edge/webview2/

## ✨ Fonctionnalités

Une fois lancée, l'application :
- Affiche un compte à rebours de 15 minutes
- Montre des conseils écologiques avec des animations
- Calcule en temps réel la consommation énergétique
- Permet d'annuler l'extinction avec le bouton "Je suis toujours là"

## 🎯 Différences avec la version Electron

| Aspect | Electron | Tauri |
|--------|----------|-------|
| Taille | ~150 MB | ~10 MB |
| Mémoire | ~200 MB | ~40 MB |
| Backend | Node.js | Rust |
| Startup | ~2-3 sec | ~1 sec |

## 📚 Documentation

- [Documentation Tauri](https://tauri.app/)
- [Guide Rust](https://www.rust-lang.org/learn)
- [sysinfo crate](https://docs.rs/sysinfo/)



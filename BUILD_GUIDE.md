# Guide de Build - Éteignage Automatique

## 📁 Structure du projet

```
EteignageAuto/
├── public/              # Fichiers web de l'interface
│   ├── index.html      # Interface principale
│   └── assets/         # Images et ressources
├── src-tauri/          # Code Rust backend
│   ├── src/            # Code source
│   └── icons/          # Icônes de l'application
├── build-portable.ps1  # Script de build complet
├── build-quick.ps1     # Script de build rapide
└── package.json        # Configuration npm
```

## 🚀 Comment créer un .exe portable

### Prérequis
- Node.js installé
- Rust installé (avec cargo)
- Les dépendances du projet installées

### Installation des dépendances (première fois)

```powershell
# Installer les dépendances npm
npm install
```

### Build de l'application

#### Option 1 : Build complet avec installateur NSIS
```powershell
npm run build
```

Cette commande va créer :
1. **L'installateur** : `src-tauri\target\release\bundle\nsis\AutoEcoShutdown_1.1.0_x64-setup.exe`
   - Installateur pour distribuer l'application
   - Crée un raccourci dans le menu démarrer
   
2. **L'exécutable portable** : `src-tauri\target\release\AutoEcoShutdown.exe`
   - ✅ **C'est votre .exe portable !**
   - Peut être copié et utilisé n'importe où
   - Contient tous les assets empaquetés

#### Option 2 : Build direct sans installateur (plus rapide)
```powershell
cd src-tauri
cargo build --release
```

Cette commande crée uniquement :
- L'exécutable portable : `src-tauri\target\release\AutoEcoShutdown.exe`

### 📁 Où trouver votre .exe portable ?

Après le build, votre exécutable portable se trouve ici :
```
src-tauri\target\release\AutoEcoShutdown.exe
```

**Ce fichier est complètement portable** ! Vous pouvez :
- Le copier sur une clé USB
- L'envoyer à quelqu'un
- Le déplacer dans n'importe quel dossier
- L'exécuter sans installation

### ⚙️ Optimisation de la taille

L'exécutable est déjà optimisé grâce aux options dans `Cargo.toml` :
- Compression LTO activée
- Symboles de debug supprimés
- Optimisation de la taille (`opt-level = "s"`)

Taille approximative : ~8-12 MB

### 🎯 Utilisation

Double-cliquez simplement sur `AutoEcoShutdown.exe` pour lancer l'application !

### 🔧 Debugging

Si vous rencontrez des problèmes lors du build :

```powershell
# Nettoyer les builds précédents
cd src-tauri
cargo clean

# Rebuild complet
cd ..
npm run build
```

### 📦 Distribution

Pour distribuer l'application, vous avez deux options :

1. **Installateur NSIS** (recommandé pour les utilisateurs finaux)
   - Fichier : `src-tauri\target\release\bundle\nsis\AutoEcoShutdown_1.1.0_x64-setup.exe`
   - Installation classique avec désinstallation propre

2. **Exécutable portable** (recommandé pour un usage personnel)
   - Fichier : `src-tauri\target\release\AutoEcoShutdown.exe`
   - Aucune installation requise

### ❓ Problèmes courants

**Le .exe ne se lance pas**
- Vérifiez que Windows Defender ne bloque pas l'application
- Exécutez en tant qu'administrateur si nécessaire (pour la fonction d'extinction)

**Erreur lors du build**
- Assurez-vous que Rust et cargo sont à jour : `rustup update`
- Vérifiez que toutes les dépendances npm sont installées : `npm install`

**Les assets ne s'affichent pas**
- Les assets sont empaquetés automatiquement dans l'exe
- Si problème, vérifiez que le dossier `assets/` est bien présent à la racine


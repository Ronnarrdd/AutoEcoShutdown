# Guide de génération des icônes

Pour que l'application Tauri fonctionne correctement, vous devez générer les icônes.

## Option 1 : Utiliser Tauri CLI (Recommandé)

Si vous avez une icône source (PNG de 512x512 ou plus), utilisez :

```bash
cd src-tauri
npx @tauri-apps/cli icon path/to/your/icon.png
```

Cela générera automatiquement toutes les icônes nécessaires dans le dossier `src-tauri/icons/`.

## Option 2 : Copier depuis l'application Electron

Si vous avez un fichier `icon.ico` dans le dossier `assets/` de l'application Electron :

1. Copiez `assets/icon.ico` vers `src-tauri/icons/icon.ico`
2. Utilisez la commande ci-dessus pour générer les autres formats

## Formats nécessaires

Tauri a besoin des formats suivants :
- 32x32.png
- 128x128.png
- 128x128@2x.png
- icon.icns (pour macOS)
- icon.ico (pour Windows)

## Note

En attendant la génération des icônes, l'application peut fonctionner avec les icônes par défaut de Tauri.



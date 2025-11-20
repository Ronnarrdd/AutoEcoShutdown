# Script de build pour créer un .exe portable
# Usage: .\build-portable.ps1

Write-Host "🚀 Build de l'application Éteignage Automatique..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path ".\package.json")) {
    Write-Host "❌ Erreur: package.json introuvable!" -ForegroundColor Red
    Write-Host "Assurez-vous d'exécuter ce script depuis le répertoire EteignageAuto" -ForegroundColor Yellow
    exit 1
}

# Étape 1: Installer les dépendances si nécessaire
if (-not (Test-Path ".\node_modules")) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

# Étape 2: Build de l'application
Write-Host "🔨 Compilation de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
Write-Host ""

# Étape 3: Localiser les fichiers générés
$exePath = ".\src-tauri\target\release\AutoEcoShutdown.exe"
$nsisPath = ".\src-tauri\target\release\bundle\nsis\"

Write-Host "📁 Fichiers générés:" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $exePath) {
    $fileSize = [math]::Round((Get-Item $exePath).Length / 1MB, 2)
    Write-Host "  ✓ Exécutable portable:" -ForegroundColor Green
    Write-Host "    $exePath" -ForegroundColor White
    Write-Host "    Taille: $fileSize MB" -ForegroundColor Gray
    Write-Host ""
    
    # Proposer de copier le fichier sur le bureau
    $desktop = [Environment]::GetFolderPath("Desktop")
    $desktopPath = Join-Path $desktop "AutoEcoShutdown.exe"
    
    $copy = Read-Host "Voulez-vous copier l'exe sur le Bureau? (O/N)"
    if ($copy -eq "O" -or $copy -eq "o") {
        Copy-Item $exePath $desktopPath -Force
        Write-Host "  ✓ Copié sur le Bureau: $desktopPath" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "  ⚠ Exécutable portable introuvable" -ForegroundColor Yellow
}

if (Test-Path $nsisPath) {
    $nsisSetup = Get-ChildItem -Path $nsisPath -Filter "*-setup.exe" | Select-Object -First 1
    if ($nsisSetup) {
        $fileSize = [math]::Round($nsisSetup.Length / 1MB, 2)
        Write-Host "  ✓ Installateur NSIS:" -ForegroundColor Green
        Write-Host "    $($nsisSetup.FullName)" -ForegroundColor White
        Write-Host "    Taille: $fileSize MB" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host "🎉 Processus terminé!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour plus d'informations, consultez BUILD_GUIDE.md" -ForegroundColor Gray


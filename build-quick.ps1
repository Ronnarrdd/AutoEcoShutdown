# Script de build rapide (sans installateur)
# Usage: .\build-quick.ps1
# Plus rapide que build-portable.ps1 car ne crée pas l'installateur NSIS

Write-Host "⚡ Build rapide de l'application..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path ".\src-tauri")) {
    Write-Host "❌ Erreur: Dossier src-tauri introuvable!" -ForegroundColor Red
    Write-Host "Assurez-vous d'exécuter ce script depuis le répertoire EteignageAuto" -ForegroundColor Yellow
    exit 1
}

# Build direct avec cargo (plus rapide)
Write-Host "🔨 Compilation avec cargo..." -ForegroundColor Yellow
Set-Location ".\src-tauri"
cargo build --release

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Set-Location ".."

Write-Host ""
Write-Host "✅ Build terminé!" -ForegroundColor Green
Write-Host ""

# Localiser le fichier généré
$exePath = ".\src-tauri\target\release\AutoEcoShutdown.exe"

if (Test-Path $exePath) {
    $fileSize = [math]::Round((Get-Item $exePath).Length / 1MB, 2)
    Write-Host "📁 Exécutable créé:" -ForegroundColor Green
    Write-Host "  $exePath" -ForegroundColor White
    Write-Host "  Taille: $fileSize MB" -ForegroundColor Gray
    Write-Host ""
    
    # Proposer de copier le fichier sur le bureau
    $desktop = [Environment]::GetFolderPath("Desktop")
    $desktopPath = Join-Path $desktop "AutoEcoShutdown.exe"
    
    Write-Host "📋 Options:" -ForegroundColor Cyan
    Write-Host "  1. Copier sur le Bureau" -ForegroundColor White
    Write-Host "  2. Ouvrir le dossier contenant l'exe" -ForegroundColor White
    Write-Host "  3. Lancer l'application" -ForegroundColor White
    Write-Host "  4. Quitter" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Votre choix (1-4)"
    
    switch ($choice) {
        "1" {
            Copy-Item $exePath $desktopPath -Force
            Write-Host "  ✓ Copié sur le Bureau!" -ForegroundColor Green
        }
        "2" {
            explorer.exe ".\src-tauri\target\release"
        }
        "3" {
            Start-Process $exePath
        }
        default {
            Write-Host "  Au revoir!" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "❌ Exécutable introuvable" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Terminé!" -ForegroundColor Cyan


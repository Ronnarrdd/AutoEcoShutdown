@echo off
setlocal enabledelayedexpansion

:: ========================================
:: Configuration de l'application
:: ========================================
:: Chemin vers l'application (doit être dans le même dossier que ce script)
set "APP_PATH=%~dp0AutoEcoShutdown.exe"

:: ========================================
:: Lancement de l'application
:: ========================================
:: Créer et exécuter une tâche pour afficher l'application dans la session active
schtasks /Create /TN "LaunchAutoEcoShutdown" /TR "'%APP_PATH%'" /SC ONCE /ST 00:00 /IT /F
schtasks /Run /TN "LaunchAutoEcoShutdown"

:: Attendre un peu que l'application démarre
timeout /t 2 /nobreak

:: Nettoyer la tâche temporaire
schtasks /Delete /TN "LaunchAutoEcoShutdown" /F 
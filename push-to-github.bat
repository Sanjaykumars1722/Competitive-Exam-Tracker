@echo off
setlocal
title Push Competitive Exam Tracker to GitHub
cls
echo ================================================================
echo           Competitive Exam Tracker - GitHub Push
echo ================================================================
echo.
set "PATH=%LOCALAPPDATA%\Programs\Git64\cmd;%LOCALAPPDATA%\Programs\Git64\mingw64\bin;%PATH%"
set "GCM_GIT_PATH=%LOCALAPPDATA%\Programs\Git64\cmd\git.exe"

echo Choose how you would like to authenticate with GitHub:
echo   [1] Web Browser Sign-In (Default)
echo   [2] Personal Access Token (PAT)
echo.
set /p choice="Enter choice (1 or 2, default is 1): "

if "%choice%"=="2" goto UseToken
goto UseBrowser

:UseToken
echo.
echo ----------------------------------------------------------------
echo HOW TO GET A TOKEN:
echo 1. In browser, visit: https://github.com/settings/tokens
echo 2. Click "Generate new token" -> "Generate new token (classic)"
echo 3. Check the [x] repo checkbox and click "Generate token"
echo ----------------------------------------------------------------
echo.
set /p PAT="Paste your GitHub Personal Access Token: "
if "%PAT%"=="" (
    echo No token provided. Exiting.
    pause
    exit /b 1
)
echo.
echo Pushing with Personal Access Token...
git push "https://%PAT%@github.com/Sanjaykumars1722/Competitive-Exam-Tracker.git" main
goto Finish

:UseBrowser
echo.
echo Pushing with Browser Login...
echo (Git Credential Manager will open a browser tab to authorize)
echo.
git push -u origin main
goto Finish

:Finish
if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================================
    echo   SUCCESSFULLY PUSHED TO GITHUB!
    echo   View online: https://github.com/Sanjaykumars1722/Competitive-Exam-Tracker
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo   Push failed or was cancelled. See above message.
    echo ================================================================
)

echo.
pause

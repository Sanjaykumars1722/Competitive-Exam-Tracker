@echo off
title Competitive Exam Tracker
cls
echo ================================================================
echo             Competitive Exam Tracker - Launcher
echo ================================================================
echo.
echo Starting backend and frontend services...
echo.

:: Open browser after 2 seconds
start "" powershell -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:5173/login'"

:: Run dev servers
npm run dev

@echo off
title Fix Internet DNS (Google DNS)
cls
:: Request Admin Elevation
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    echo Requesting Administrator permissions to fix Wi-Fi DNS...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ================================================================
echo           Setting Wi-Fi DNS to Google DNS (8.8.8.8)
echo ================================================================
echo.
netsh interface ip set dns name="Wi-Fi" static 8.8.8.8
netsh interface ip add dns name="Wi-Fi" 8.8.4.4 index=2
ipconfig /flushdns
echo.
echo ================================================================
echo   SUCCESS! DNS is now set to Google DNS (8.8.8.8).
echo   Websites like Render, Vercel, and GitHub will now open!
echo ================================================================
echo.
pause

@echo off
echo ===================================================
echo Pushing Competitive Exam Tracker to GitHub...
echo ===================================================
"%LOCALAPPDATA%\Programs\Git64\cmd\git.exe" push -u origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo Successfully pushed to GitHub!
    echo Visit: https://github.com/Sanjaykumars1722/Competitive-Exam-Tracker
) else (
    echo.
    echo Push failed or cancelled.
)
pause

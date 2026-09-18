[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           Competitive Exam Tracker - GitHub Push              " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$env:PATH = "$env:LOCALAPPDATA\Programs\Git64\cmd;$env:LOCALAPPDATA\Programs\Git64\mingw64\bin;" + $env:PATH
$env:GCM_GIT_PATH = "$env:LOCALAPPDATA\Programs\Git64\cmd\git.exe"
$git = "$env:LOCALAPPDATA\Programs\Git64\cmd\git.exe"

Write-Host "Choose authentication method:" -ForegroundColor Yellow
Write-Host "  [1] Web Browser Sign-In (Default)"
Write-Host "  [2] Personal Access Token (PAT)"
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2, default is 1)"

if ($choice -eq "2") {
    Write-Host "`n----------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "1. Visit: https://github.com/settings/tokens"
    Write-Host "2. Click 'Generate new token (classic)'"
    Write-Host "3. Select the [x] repo scope, generate, and copy the token."
    Write-Host "----------------------------------------------------------------`n" -ForegroundColor Cyan
    $token = Read-Host "Paste your GitHub Personal Access Token"
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Host "No token entered. Aborted." -ForegroundColor Red
        pause
        exit
    }
    Write-Host "`nPushing with Personal Access Token..." -ForegroundColor Green
    & $git push "https://$($token)@github.com/Sanjaykumars1722/Competitive-Exam-Tracker.git" main
} else {
    Write-Host "`nPushing with Browser Login..." -ForegroundColor Green
    Write-Host "(Your browser will open to authorize GitHub)`n" -ForegroundColor DarkGray
    & $git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n================================================================" -ForegroundColor Green
    Write-Host "  SUCCESSFULLY PUSHED TO GITHUB!" -ForegroundColor Green
    Write-Host "  View online: https://github.com/Sanjaykumars1722/Competitive-Exam-Tracker" -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Green
} else {
    Write-Host "`n================================================================" -ForegroundColor Red
    Write-Host "  Push failed or was cancelled." -ForegroundColor Red
    Write-Host "================================================================" -ForegroundColor Red
}

pause

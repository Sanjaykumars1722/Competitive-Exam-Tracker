Write-Host "Pushing Competitive Exam Tracker to GitHub..." -ForegroundColor Cyan
$git = "$env:LOCALAPPDATA\Programs\Git64\cmd\git.exe"
& $git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccessfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Visit: https://github.com/Sanjaykumars1722/Competitive-Exam-Tracker" -ForegroundColor Cyan
} else {
    Write-Host "`nPush failed or cancelled." -ForegroundColor Red
}

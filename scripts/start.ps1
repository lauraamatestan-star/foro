$root = Split-Path -Parent $PSScriptRoot
$phpIni = Join-Path $root "tools\php\php.ini"
$php = Join-Path $root "tools\php\php.exe"
if (-not (Test-Path $php)) {
  $php = if (Get-Command php -ErrorAction SilentlyContinue) { "php" } else { $php }
  $phpIni = $null
}

$phpArgs = if ($phpIni -and (Test-Path $phpIni)) { "-c `"$phpIni`"" } else { "" }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; & '$php' $phpArgs artisan serve"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm start"

Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:4200" -ForegroundColor Green

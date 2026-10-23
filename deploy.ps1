# ZAVIRO Portfolio auf Cloudflare Pages veroeffentlichen
# Projekt: zaviro -> https://zaviro.pages.dev/
#
# Es wird ein Staging-Ordner hochgeladen, damit Hilfsdateien (server.js,
# deploy.ps1, deploy.log) nicht oeffentlich im Netz landen.
$ErrorActionPreference = 'Stop'

$dir   = 'E:\ZAVIRO\ZAVIRO.com'
$stage = Join-Path $env:TEMP 'zaviro-portfolio-deploy'
$log   = Join-Path $dir 'deploy.log'
$skipFiles = @('deploy.ps1', 'server.js', '.gitignore', 'deploy.log', 'netlify.toml')
$skipDirs  = @('.git', 'node_modules', '.netlify', '.wrangler')

Write-Host ''
Write-Host '=== Portfolio deployen (Cloudflare Pages) ===' -ForegroundColor Cyan

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

Get-ChildItem $dir -File |
  Where-Object { $skipFiles -notcontains $_.Name } |
  Copy-Item -Destination $stage -Force
Get-ChildItem $dir -Directory |
  Where-Object { $skipDirs -notcontains $_.Name } |
  Copy-Item -Destination $stage -Recurse -Force

Write-Host ("Staging: " + ((Get-ChildItem $stage -File).Count) + " Dateien") -ForegroundColor Gray

Push-Location $dir
try {
  # Ausgabe ueber cmd umleiten: wrangler schreibt Fortschritt nach stderr,
  # PowerShell 5.1 wuerde das mit ErrorActionPreference=Stop abbrechen.
  cmd /c "npx --yes wrangler@latest pages deploy `"$stage`" --project-name zaviro --branch main --commit-dirty=true > `"$log`" 2>&1"
  if ($LASTEXITCODE -ne 0) {
    Get-Content $log -Tail 25 | Write-Host
    throw "Deploy fehlgeschlagen (Exit $LASTEXITCODE)"
  }
  Get-Content $log -Tail 3 | Write-Host
} finally {
  Pop-Location
}

$r = Invoke-WebRequest 'https://zaviro.pages.dev/' -UseBasicParsing -TimeoutSec 60
Write-Host ''
Write-Host ("Live: https://zaviro.pages.dev/ (HTTP " + $r.StatusCode + ")") -ForegroundColor Green
Write-Host ''
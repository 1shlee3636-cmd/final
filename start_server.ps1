# PowerShell script to start a simple HTTP server from project root
Set-Location -Path $PSScriptRoot
Write-Host "Starting simple HTTP server on port 8000..."
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 8000
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    py -3 -m http.server 8000
} else {
    Write-Host "Python not found. Install Python 3 or use VSCode Live Server / npx http-server."
    Pause
}

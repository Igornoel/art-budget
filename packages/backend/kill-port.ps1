# Script to kill process on port 3001
$processId = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1

if ($processId) {
    Write-Host "Killing process $processId on port 3001..."
    Stop-Process -Id $processId -Force
    Write-Host "✅ Process killed successfully"
} else {
    Write-Host "ℹ️  No process found on port 3001"
}








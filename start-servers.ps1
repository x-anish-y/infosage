# Start both servers without using concurrently
# This script avoids Windows batch termination issues

Write-Host "Killing any existing node processes..." -ForegroundColor Yellow
taskkill /IM node.exe /F 2>$null | Out-Null
taskkill /IM npm.exe /F 2>$null | Out-Null

Start-Sleep -Seconds 3

Write-Host "Starting backend server..." -ForegroundColor Green
$backendPath = "$PSScriptRoot\backend"
$backendProcess = Start-Process -WorkingDirectory $backendPath -FilePath "node" -ArgumentList "src/server.js" -PassThru -NoNewWindow

Start-Sleep -Seconds 2

Write-Host "Starting frontend server..." -ForegroundColor Green
$frontendPath = "$PSScriptRoot\frontend"
$frontendProcess = Start-Process -WorkingDirectory $frontendPath -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -PassThru -NoNewWindow

Write-Host "Servers started!" -ForegroundColor Green
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all servers." -ForegroundColor Yellow

# Wait for backend process
Wait-Process -Id $backendProcess.Id

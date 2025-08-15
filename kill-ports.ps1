# Kill processes running on port 8080 (backend)
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object {
    $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process $($process.ProcessName) with PID $($_.OwningProcess) on port 8080"
        Stop-Process -Id $_.OwningProcess -Force
    }
}

# Kill processes running on port 3000 (frontend)
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object {
    $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Killing process $($process.ProcessName) with PID $($_.OwningProcess) on port 3000"
        Stop-Process -Id $_.OwningProcess -Force
    }
}

Write-Host "Ports 8080 and 3000 cleared successfully!"

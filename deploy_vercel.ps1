Write-Host "Checking Vercel Login..."
$whoami = npx vercel whoami 2>&1
if ($whoami -match "Error" -or $whoami -match "No existing credentials") {
    Write-Host "Please login to Vercel..."
    npx vercel login
}

Write-Host "Deploying Backend..."
Push-Location "apps/backend"
# Deploy backend
$backendOutput = npx vercel deploy --prod --yes 2>&1
# Extract URL (last line usually)
$backendUrl = $backendOutput | Select-Object -Last 1
Write-Host "Backend URL: $backendUrl"
Pop-Location

if ($backendUrl -match "https://") {
    Write-Host "Deploying Frontend with API_URL=$backendUrl..."
    Push-Location "apps/frontend"
    $frontendUrl = npx vercel deploy --prod --yes --env VITE_API_URL=$backendUrl 2>&1 | Select-Object -Last 1
    Write-Host "Frontend URL: $frontendUrl"
    Pop-Location
    
    Write-Host "Deployment Complete!"
    Write-Host "Frontend: $frontendUrl"
    Write-Host "Backend: $backendUrl"
} else {
    Write-Host "Backend deployment failed or URL not captured."
    Write-Host "Output: $backendOutput"
}

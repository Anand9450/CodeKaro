Write-Host "Checking Vercel Login..."
$whoami = npx vercel whoami 2>&1
if ($whoami -match "Error" -or $whoami -match "No existing credentials") {
    Write-Host "Please login to Vercel..."
    npx vercel login
}

Write-Host "Deploying Backend..."
Push-Location "apps/backend"
# Deploy backend
$SUPABASE_URL="https://akmfcahygdcakplimryl.supabase.co"
$SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrbWZjYWh5Z2RjYWtwbGltcnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDU5NTIsImV4cCI6MjA4NjkyMTk1Mn0.a_n8CNUEoqOfFBG_F_hW2pp7p65tVlN3P-_1gxyQnXw"
$JWT_SECRET="code-karo-secure-jwt-secret-2026"

# Deploy backend with Environment Variables injected directly
$backendOutput = npx vercel deploy --prod --yes --env "SUPABASE_URL=$SUPABASE_URL" --env "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" --env "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_ANON_KEY" --env "JWT_SECRET=$JWT_SECRET" 2>&1
# Extract URL (last line usually)
$backendUrl = $backendOutput | Select-Object -Last 1
Write-Host "Backend URL: $backendUrl"
Pop-Location

if ($backendUrl -match "https://") {
    Write-Host "Deploying Frontend with API_URL=$backendUrl..."
    Push-Location "apps/frontend"
    $frontendUrl = npx vercel deploy --prod --yes --env VITE_API_URL="$backendUrl/api" 2>&1 | Select-Object -Last 1
    Write-Host "Frontend URL: $frontendUrl"
    Pop-Location
    
    Write-Host "Deployment Complete!"
    Write-Host "Frontend: $frontendUrl"
    Write-Host "Backend: $backendUrl"
} else {
    Write-Host "Backend deployment failed or URL not captured."
    Write-Host "Output: $backendOutput"
}

# Link project
echo "Linking Vercel Project..."
vercel link --yes --project codekaro

# Define variables
$vars = @{
    "SUPABASE_URL" = "https://akmfcahygdcakplimryl.supabase.co"
    "SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrbWZjYWh5Z2RjYWtwbGltcnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDU5NTIsImV4cCI6MjA4NjkyMTk1Mn0.a_n8CNUEoqOfFBG_F_hW2pp7p65tVlN3P-_1gxyQnXw"
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrbWZjYWh5Z2RjYWtwbGltcnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDU5NTIsImV4cCI6MjA4NjkyMTk1Mn0.a_n8CNUEoqOfFBG_F_hW2pp7p65tVlN3P-_1gxyQnXw"
    "JWT_SECRET" = "CodeKaroSuperSecretKey2026"
}

# Loop through variables
foreach ($key in $vars.Keys) {
    echo "Setting $key..."
    # Try to remove existing one first (ignore error if not exists)
    vercel env rm $key production --yes
    
    # Add new value
    $vars[$key] | vercel env add $key production
}

# Deploy
echo "Deploying to Production..."
vercel --prod

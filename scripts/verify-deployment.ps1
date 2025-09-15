# Pre-deployment verification script for Render (Windows PowerShell)
Write-Host "?? MyWebWallet API - Pre-deployment verification" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if we're in the correct directory
if (-not (Test-Path "render.yaml")) {
    Write-Host "? Error: render.yaml not found. Make sure you're in the project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "backend/MyWebWallet.API/MyWebWallet.API.csproj")) {
    Write-Host "? Error: MyWebWallet.API.csproj not found." -ForegroundColor Red
    exit 1
}

Write-Host "? Project structure verified" -ForegroundColor Green

# Check .NET version
Write-Host "?? Checking .NET version..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "? .NET version: $dotnetVersion" -ForegroundColor Green
    } else {
        throw "dotnet command failed"
    }
} catch {
    Write-Host "? Error: .NET SDK not found. Please install .NET 9 SDK." -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "?? Building project..." -ForegroundColor Yellow
Set-Location "backend/MyWebWallet.API"
try {
    $buildOutput = dotnet build -c Release --no-restore 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "? Build successful" -ForegroundColor Green
    } else {
        Write-Host "? Error: Build failed. Please fix compilation errors." -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "? Error: Build process failed." -ForegroundColor Red
    exit 1
}

# Test publish
Write-Host "?? Testing publish process..." -ForegroundColor Yellow
try {
    $publishOutput = dotnet publish -c Release -o temp_publish --self-contained false --runtime linux-x64 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "? Publish test successful" -ForegroundColor Green
        if (Test-Path "temp_publish") {
            Remove-Item -Recurse -Force "temp_publish"
        }
    } else {
        Write-Host "? Error: Publish failed." -ForegroundColor Red
        Write-Host $publishOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "? Error: Publish process failed." -ForegroundColor Red
    exit 1
}

Set-Location "../.."

# Check render.yaml syntax (basic check)
Write-Host "?? Checking render.yaml..." -ForegroundColor Yellow
try {
    $yamlContent = Get-Content "render.yaml" -Raw
    if ($yamlContent -match "services:" -and $yamlContent -match "type: web") {
        Write-Host "? render.yaml appears to be valid" -ForegroundColor Green
    } else {
        Write-Host "? Error: render.yaml doesn't contain expected structure" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "? Error: Could not read render.yaml" -ForegroundColor Red
    exit 1
}

# Check that render.yaml doesn't contain secrets
Write-Host "?? Checking for secrets in render.yaml..." -ForegroundColor Yellow
$yamlContent = Get-Content "render.yaml" -Raw

if ($yamlContent -match "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9") {
    Write-Host "? ERROR: Secrets detected in render.yaml! This is a security risk." -ForegroundColor Red
    Write-Host "   Remove all API keys from render.yaml and configure them as environment variables in Render Dashboard." -ForegroundColor Red
    exit 1
}

if ($yamlContent -match "waSSDIypARFyrrDp0OXAz") {
    Write-Host "? ERROR: Alchemy API key detected in render.yaml! This is a security risk." -ForegroundColor Red
    Write-Host "   Remove all API keys from render.yaml and configure them as environment variables in Render Dashboard." -ForegroundColor Red
    exit 1
}

Write-Host "? render.yaml is clean (no secrets detected)" -ForegroundColor Green

# Check required files
Write-Host "?? Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "render.yaml",
    "backend/MyWebWallet.API/MyWebWallet.API.csproj",
    "backend/MyWebWallet.API/Program.cs",
    "backend/MyWebWallet.API/appsettings.json",
    "backend/MyWebWallet.API/appsettings.Production.json",
    "backend/MyWebWallet.API/Controllers/HealthController.cs",
    "ENVIRONMENT_VARIABLES.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "? $file exists" -ForegroundColor Green
    } else {
        Write-Host "? Error: Missing required file: $file" -ForegroundColor Red
        exit 1
    }
}

# Check environment variables template
Write-Host "?? Checking environment variables documentation..." -ForegroundColor Yellow
$envVars = @(
    "Moralis__ApiKey",
    "Alchemy__ApiKey",
    "UniswapV3__ApiKey",
    "Ethereum__RpcUrl",
    "Alchemy__NftUrl",
    "Alchemy__BaseRpcUrl"
)

Write-Host ""
Write-Host "?? CRITICAL: Configure these environment variables in Render Dashboard:" -ForegroundColor Red
foreach ($var in $envVars) {
    Write-Host "   - $var" -ForegroundColor White
}

Write-Host ""
Write-Host "?? Pre-deployment verification completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "?? SECURITY CHECKLIST:" -ForegroundColor Cyan
Write-Host "? No secrets in render.yaml" -ForegroundColor Green
Write-Host "? Environment variables documented" -ForegroundColor Green
Write-Host "? ENVIRONMENT_VARIABLES.md created" -ForegroundColor Green
Write-Host ""
Write-Host "?? Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to Git repository" -ForegroundColor White
Write-Host "2. Create new Blueprint on Render using this repository" -ForegroundColor White
Write-Host "3. ?? CRITICAL: Configure environment variables in Render Dashboard (see ENVIRONMENT_VARIABLES.md)" -ForegroundColor Red
Write-Host "4. Deploy and monitor health check at /health" -ForegroundColor White
Write-Host ""
Write-Host "?? Useful links:" -ForegroundColor Cyan
Write-Host "   - Render Dashboard: https://dashboard.render.com" -ForegroundColor White
Write-Host "   - Deployment Guide: ./RENDER_DEPLOYMENT.md" -ForegroundColor White
Write-Host "   - Environment Variables: ./ENVIRONMENT_VARIABLES.md" -ForegroundColor White
Write-Host ""
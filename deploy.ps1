# Marine Data Verse Deployment Script for Windows
# Usage: .\deploy.ps1 -Environment "production" -Platform "docker"

param(
    [Parameter(Position=0)]
    [string]$Environment = "development",
    
    [Parameter(Position=1)]
    [string]$Platform = "docker"
)

$ProjectName = "marine-data-verse"

Write-Host "🌊 Deploying Marine Data Verse..." -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Platform: $Platform" -ForegroundColor Yellow

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    }
    
    # Check Node.js version
    $nodeVersion = node -v
    $versionNumber = $nodeVersion -replace 'v', ''
    if ([version]$versionNumber -lt [version]"18.0.0") {
        Write-Error "Node.js version $nodeVersion is too old. Required: v18.0.0+"
        exit 1
    }
    
    # Check npm
    if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed"
        exit 1
    }
    
    Write-Info "Prerequisites check passed ✓"
}

function Install-Dependencies {
    Write-Info "Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
    Write-Info "Dependencies installed ✓"
}

function Build-Application {
    Write-Info "Building application for $Environment..."
    
    if ($Environment -eq "production") {
        npm run build
    } else {
        npm run build:dev
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
    
    Write-Info "Application built ✓"
}

function Deploy-Docker {
    Write-Info "Deploying with Docker..."
    
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed"
        exit 1
    }
    
    # Build Docker image
    docker build -t "${ProjectName}:$Environment" .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed"
        exit 1
    }
    
    # Stop existing container if running
    $existingContainer = docker ps -q -f "name=$ProjectName"
    if ($existingContainer) {
        Write-Warn "Stopping existing container..."
        docker stop $ProjectName
        docker rm $ProjectName
    }
    
    # Run new container
    docker run -d --name $ProjectName -p 80:80 --restart unless-stopped "${ProjectName}:$Environment"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start Docker container"
        exit 1
    }
    
    Write-Info "Docker deployment completed ✓"
    Write-Info "Application available at: http://localhost"
}

function Deploy-Vercel {
    Write-Info "Deploying to Vercel..."
    
    if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
        Write-Warn "Vercel CLI not found. Installing..."
        npm install -g vercel
    }
    
    if ($Environment -eq "production") {
        vercel --prod
    } else {
        vercel
    }
    
    Write-Info "Vercel deployment completed ✓"
}

function Deploy-Netlify {
    Write-Info "Deploying to Netlify..."
    
    if (-not (Get-Command "netlify" -ErrorAction SilentlyContinue)) {
        Write-Warn "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    }
    
    if ($Environment -eq "production") {
        netlify deploy --prod --dir=dist
    } else {
        netlify deploy --dir=dist
    }
    
    Write-Info "Netlify deployment completed ✓"
}

function Test-Health {
    if ($Platform -eq "docker") {
        Write-Info "Performing health check..."
        Start-Sleep -Seconds 5
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Info "Health check passed ✓"
            } else {
                Write-Error "Health check failed ✗"
                exit 1
            }
        } catch {
            Write-Error "Health check failed ✗"
            exit 1
        }
    }
}

# Main deployment flow
function Main {
    Write-Info "Starting deployment process..."
    
    Test-Prerequisites
    Install-Dependencies
    Build-Application
    
    switch ($Platform) {
        "docker" {
            Deploy-Docker
            Test-Health
        }
        "vercel" {
            Deploy-Vercel
        }
        "netlify" {
            Deploy-Netlify
        }
        default {
            Write-Error "Unknown platform: $Platform"
            Write-Info "Supported platforms: docker, vercel, netlify"
            exit 1
        }
    }
    
    Write-Info "🎉 Deployment completed successfully!"
}

# Run main function
Main
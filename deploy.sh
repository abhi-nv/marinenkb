#!/bin/bash

# Marine Data Verse Deployment Script
# Usage: ./deploy.sh [environment] [platform]
# Example: ./deploy.sh production docker

set -e

ENVIRONMENT=${1:-development}
PLATFORM=${2:-docker}
PROJECT_NAME="marine-data-verse"

echo "🌊 Deploying Marine Data Verse..."
echo "Environment: $ENVIRONMENT"
echo "Platform: $PLATFORM"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    if ! dpkg --compare-versions "$NODE_VERSION" "ge" "$REQUIRED_VERSION"; then
        log_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm ci
    log_info "Dependencies installed ✓"
}

# Build application
build_app() {
    log_info "Building application for $ENVIRONMENT..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build
    else
        npm run build:dev
    fi
    
    log_info "Application built ✓"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Build Docker image
    docker build -t $PROJECT_NAME:$ENVIRONMENT .
    
    # Stop existing container if running
    if docker ps -q -f name=$PROJECT_NAME; then
        log_warn "Stopping existing container..."
        docker stop $PROJECT_NAME
        docker rm $PROJECT_NAME
    fi
    
    # Run new container
    docker run -d \
        --name $PROJECT_NAME \
        -p 80:80 \
        --restart unless-stopped \
        $PROJECT_NAME:$ENVIRONMENT
    
    log_info "Docker deployment completed ✓"
    log_info "Application available at: http://localhost"
}

# Deploy to Vercel
deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        log_warn "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
    
    log_info "Vercel deployment completed ✓"
}

# Deploy to Netlify
deploy_netlify() {
    log_info "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        log_warn "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        netlify deploy --prod --dir=dist
    else
        netlify deploy --dir=dist
    fi
    
    log_info "Netlify deployment completed ✓"
}

# Health check
health_check() {
    if [ "$PLATFORM" = "docker" ]; then
        log_info "Performing health check..."
        sleep 5
        
        if curl -f http://localhost/health &> /dev/null; then
            log_info "Health check passed ✓"
        else
            log_error "Health check failed ✗"
            exit 1
        fi
    fi
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    
    check_prerequisites
    install_dependencies
    build_app
    
    case $PLATFORM in
        docker)
            deploy_docker
            health_check
            ;;
        vercel)
            deploy_vercel
            ;;
        netlify)
            deploy_netlify
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            log_info "Supported platforms: docker, vercel, netlify"
            exit 1
            ;;
    esac
    
    log_info "🎉 Deployment completed successfully!"
}

# Run main function
main "$@"
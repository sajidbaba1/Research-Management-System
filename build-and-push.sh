#!/bin/bash

# Research Management System Docker Build and Push Script
# Usage: ./build-and-push.sh [DOCKER_HUB_USERNAME]

set -e

# Configuration
DOCKER_HUB_USERNAME=${1:-yourusername}
BACKEND_IMAGE="${DOCKER_HUB_USERNAME}/research-management-backend:latest"
FRONTEND_IMAGE="${DOCKER_HUB_USERNAME}/research-management-frontend:latest"
COMPOSE_IMAGE="${DOCKER_HUB_USERNAME}/research-management-compose:latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Research Management System Docker Build & Push${NC}"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if Docker Hub username is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Warning: No Docker Hub username provided. Using 'yourusername'${NC}"
    echo -e "${YELLOW}Usage: $0 YOUR_DOCKER_HUB_USERNAME${NC}"
    echo ""
fi

# Build backend
echo -e "${GREEN}Building backend image...${NC}"
docker build -t "${BACKEND_IMAGE}" .

# Build frontend
echo -e "${GREEN}Building frontend image...${NC}"
docker build -t "${FRONTEND_IMAGE}" ./frontend

# Test images locally (optional)
echo -e "${GREEN}Testing backend...${NC}"
docker run -d --name test-backend -p 8080:8080 "${BACKEND_IMAGE}"
sleep 10
docker logs test-backend
docker stop test-backend
docker rm test-backend

# Push to Docker Hub
echo -e "${GREEN}Pushing images to Docker Hub...${NC}"
docker push "${BACKEND_IMAGE}"
docker push "${FRONTEND_IMAGE}"

# Create and push compose image
echo -e "${GREEN}Building compose image...${NC}"
docker build -t "${COMPOSE_IMAGE}" -f docker-compose.yml .
docker push "${COMPOSE_IMAGE}"

echo -e "${GREEN}Build and push completed successfully!${NC}"
echo ""
echo "Images available at:"
echo "Backend: ${BACKEND_IMAGE}"
echo "Frontend: ${FRONTEND_IMAGE}"
echo "Compose: ${COMPOSE_IMAGE}"

# Instructions for users
echo ""
echo -e "${GREEN}To run the application:${NC}"
echo "1. Using Docker Compose:"
echo "   docker-compose up"
echo ""
echo "2. Using individual containers:"
echo "   docker run -p 8080:8080 ${BACKEND_IMAGE}"
echo "   docker run -p 3000:80 ${FRONTEND_IMAGE}"
echo ""
echo "3. Using Docker Compose with environment variables:"
echo "   GROQ_API_KEY=your_key PINECONE_API_KEY=your_key docker-compose up"

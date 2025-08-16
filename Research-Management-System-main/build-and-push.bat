@echo off
setlocal enabledelayedexpansion

REM Research Management System Docker Build and Push Script (Windows)
REM Usage: build-and-push.bat [DOCKER_HUB_USERNAME]

set DOCKER_HUB_USERNAME=%1
if "%DOCKER_HUB_USERNAME%"=="" (
    set DOCKER_HUB_USERNAME=yourusername
    echo WARNING: No Docker Hub username provided. Using 'yourusername'
    echo Usage: %0 YOUR_DOCKER_HUB_USERNAME
    echo.
)

echo Research Management System Docker Build & Push
echo ==============================================

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Configuration
set BACKEND_IMAGE=%DOCKER_HUB_USERNAME%/research-management-backend:latest
set FRONTEND_IMAGE=%DOCKER_HUB_USERNAME%/research-management-frontend:latest
set COMPOSE_IMAGE=%DOCKER_HUB_USERNAME%/research-management-compose:latest

echo Building backend image...
docker build -t %BACKEND_IMAGE% .
if errorlevel 1 (
    echo ERROR: Backend build failed
    pause
    exit /b 1
)

echo Building frontend image...
docker build -t %FRONTEND_IMAGE% ./frontend
if errorlevel 1 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)

echo Pushing images to Docker Hub...
docker push %BACKEND_IMAGE%
if errorlevel 1 (
    echo ERROR: Failed to push backend image
    pause
    exit /b 1
)

docker push %FRONTEND_IMAGE%
if errorlevel 1 (
    echo ERROR: Failed to push frontend image
    pause
    exit /b 1
)

echo Build and push completed successfully!
echo.
echo Images available at:
echo Backend: %BACKEND_IMAGE%
echo Frontend: %FRONTEND_IMAGE%
echo.
echo To run the application:
echo 1. Using Docker Compose:
echo    docker-compose up
echo.
echo 2. Using individual containers:
echo    docker run -p 8080:8080 %BACKEND_IMAGE%
echo    docker run -p 3000:80 %FRONTEND_IMAGE%
echo.
echo 3. Using Docker Compose with environment variables:
echo    set GROQ_API_KEY=your_key
echo    set PINECONE_API_KEY=your_key
echo    docker-compose up

pause

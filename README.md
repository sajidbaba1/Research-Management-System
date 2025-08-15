# Research Management System

## Project Versions

- **Backend (Maven project)**: `1.0.0-SNAPSHOT`
- **Frontend (Node.js project)**: `0.1.0`

## Overview

This is a comprehensive Research Management System designed to help researchers and institutions manage their projects, documents, and collaboration efforts efficiently.

## Features

- Project creation and management
- Document storage and retrieval
- Team member management
- Budget tracking
- Milestone and task management
- Publication and patent management
- Risk assessment
- Deliverable tracking
- Analytics dashboard
- AI-powered search and insights (RAG)

## Backend

The backend is built with Spring Boot and Java 17.

### Dependencies

- Spring Boot 3.3.2
- Spring Web
- Spring Data JPA
- MySQL Driver
- Spring Security
- JWT Authentication

## Frontend

The frontend is built with React and TypeScript.

### Dependencies

- React 19.1.1
- TypeScript
- Axios
- Chart.js
- Tailwind CSS
- Framer Motion
- Three.js

## Setup

### Backend Setup

1. Ensure you have Java 17 installed
2. Set up MySQL database
3. Configure `application.properties` with your database settings
4. Run the application using Maven: `./mvnw spring-boot:run`

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## Environment Variables

The application requires several environment variables to be set. Check `.env.example` for the required variables.

## Contributing

Please make sure to follow the existing code style and conventions when contributing to this project.

## License

This project is licensed under the MIT License.

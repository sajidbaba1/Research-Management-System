# Multi-stage Dockerfile for Spring Boot backend
# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Leverage Docker cache for dependencies
COPY pom.xml ./
RUN mvn -B -q -DskipTests dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn -B -DskipTests clean package

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy fat jar from build stage
COPY --from=build /app/target/*.jar /app/app.jar

# Expose default port (Render will pass $PORT)
EXPOSE 8080

# Optional JVM flags via JAVA_OPTS
ENV JAVA_OPTS=""

# Ensure the app binds to $PORT on Render
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]

# Étape 1 : Utiliser une image Maven avec OpenJDK 17 pour construire l'application
FROM maven:3.9.9-openjdk-17-slim AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier le fichier pom.xml et télécharger les dépendances Maven
COPY pom.xml .
RUN mvn dependency:go-offline

# Copier le code source
COPY src ./src

# Exécuter la compilation du WAR de l'application Spring Boot
RUN mvn clean package -DskipTests

# Étape 2 : Utiliser OpenJDK 17 pour exécuter l'application
FROM openjdk:17-jdk-slim

# Créer un répertoire pour l'application
WORKDIR /app

# Copier le fichier WAR généré par Maven dans l'image Docker
COPY --from=build /app/target/GESCOMP.war /app/GESCOMP.war

# Copier les fichiers statiques Angular dans le répertoire approprié de l'application
COPY --from=build /app/dist/lms /app/src/main/resources/static

# Exposer le port de l'application
EXPOSE 8081

# Commande pour démarrer l'application Spring Boot
ENTRYPOINT ["java", "-jar", "/app/GESCOMP.war"]

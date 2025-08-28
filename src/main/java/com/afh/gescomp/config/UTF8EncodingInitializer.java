package com.afh.gescomp.config;

import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

/**
 * Initialiseur pour l'encodage UTF-8
 * Compatible avec Spring Boot 1.3.8
 * Résout les problèmes d'affichage des caractères arabes
 */
@Component
public class UTF8EncodingInitializer {

    /**
     * Initialisation automatique au démarrage de l'application
     */
    @PostConstruct
    public void initializeUTF8Encoding() {
        try {
            // Forcer l'encodage par défaut du système
            System.setProperty("file.encoding", "UTF-8");
            System.setProperty("sun.jnu.encoding", "UTF-8");
            
            // Configuration des propriétés Java pour l'encodage
            System.setProperty("spring.http.encoding.charset", "UTF-8");
            System.setProperty("spring.http.encoding.enabled", "true");
            System.setProperty("spring.http.encoding.force", "true");
            
            // Configuration de l'encodage des logs
            System.setProperty("java.util.logging.ConsoleHandler.encoding", "UTF-8");
            
            // Configuration de l'encodage pour Tomcat
            System.setProperty("server.tomcat.uri-encoding", "UTF-8");
            
            // Configuration de l'encodage pour Hibernate
            System.setProperty("hibernate.connection.characterEncoding", "utf8");
            System.setProperty("hibernate.connection.useUnicode", "true");
            System.setProperty("hibernate.connection.CharSet", "utf8");
            
            System.out.println("✅ Configuration d'encodage UTF-8 appliquée avec succès");
            System.out.println("✅ Propriétés système configurées pour l'arabe");
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la configuration de l'encodage: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 
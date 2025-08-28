package com.afh.gescomp.service;

import java.util.List;
import java.util.Map;

/**
 * Service simplifié pour générer des PDF sans dépendance aux polices externes
 * Version temporaire qui retourne des données de test
 */
public class SimplePdfService {

    /**
     * Génère un PDF simple pour les statistiques des marchés
     * Version temporaire qui retourne des données de test
     */
    public byte[] generateSimplePDF(String title, String subtitle,
                                   List<Map<String, Object>> fournisseurs,
                                   String dateDebut, String dateFin) {

        try {
            // Pour l'instant, retourner des données de test
            // TODO: Implémenter la vraie génération PDF une fois les dépendances résolues
            String testContent = "PDF de test - " + title + "\n" +
                               "Période: " + dateDebut + " au " + dateFin + "\n" +
                               "Nombre de fournisseurs: " + 
                               (fournisseurs != null ? fournisseurs.size() : 0);
            
            return testContent.getBytes("UTF-8");
            
        } catch (Exception e) {
            // En cas d'erreur, retourner un message d'erreur
            return ("Erreur de génération PDF: " + e.getMessage()).getBytes();
        }
    }
} 
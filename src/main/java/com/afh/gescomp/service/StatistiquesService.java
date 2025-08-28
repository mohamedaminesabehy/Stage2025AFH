package com.afh.gescomp.service;

import java.util.List;
import java.util.Map;

public interface StatistiquesService {
    
    /**
     * Récupère les statistiques détaillées des fournisseurs
     * @param numStruct Numéro de structure (optionnel)
     * @param page Numéro de page
     * @param size Taille de la page
     * @param filterName Filtre par nom
     * @param filterMinAmount Montant minimum
     * @param filterHasPenalites Filtre sur les pénalités
     * @return Map contenant les données des fournisseurs et leurs statistiques
     */
    Map<String, Object> getFournisseursStatistiques(String numStruct, int page, int size, 
                                                   String filterName, Double filterMinAmount, 
                                                   Boolean filterHasPenalites);
    
    /**
     * Récupère les statistiques détaillées des articles
     * @param numStruct Numéro de structure (optionnel)
     * @param page Numéro de page
     * @param size Taille de la page
     * @return Map contenant les données des articles et leurs statistiques
     */
    Map<String, Object> getArticlesStatistiques(String numStruct, int page, int size);
    
    /**
     * Récupère l'évolution des marchés par période
     * @param numStruct Numéro de structure (optionnel)
     * @param period Période (3months, 6months, 12months)
     * @return Map contenant les données d'évolution
     */
    Map<String, Object> getMarchesEvolutionByPeriod(String numStruct, String period);
    
    /**
     * Récupère l'évolution des marchés par dates personnalisées
     * @param numStruct Numéro de structure (optionnel)
     * @param dateDebut Date de début au format YYYY-MM-DD
     * @param dateFin Date de fin au format YYYY-MM-DD
     * @return Map contenant les données d'évolution
     */
    Map<String, Object> getMarchesEvolutionByDates(String numStruct, String dateDebut, String dateFin);
    
    /**
     * Récupère la répartition des fournisseurs par nombre de marchés
     * @param numStruct Numéro de structure (optionnel)
     * @param limit Nombre de fournisseurs à récupérer
     * @return Map contenant les données de répartition
     */
    Map<String, Object> getFournisseursRepartition(String numStruct, int limit);
    
    /**
     * Récupère la répartition des fournisseurs par nombre de marchés avec dates personnalisées
     * @param numStruct Numéro de structure (optionnel)
     * @param limit Nombre de fournisseurs à récupérer
     * @param dateDebut Date de début au format YYYY-MM-DD
     * @param dateFin Date de fin au format YYYY-MM-DD
     * @return Map contenant les données de répartition
     */
    Map<String, Object> getFournisseursRepartitionByDates(String numStruct, int limit, String dateDebut, String dateFin);
    
    /**
     * Récupère la répartition des marchés par région
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données de répartition par région
     */
    Map<String, Object> getRegionsRepartition(String numStruct);
    
    /**
     * Récupère la répartition des marchés par région avec dates personnalisées
     * @param numStruct Numéro de structure (optionnel)
     * @param dateDebut Date de début au format YYYY-MM-DD
     * @param dateFin Date de fin au format YYYY-MM-DD
     * @return Map contenant les données de répartition par région
     */
    Map<String, Object> getRegionsRepartitionByDates(String numStruct, String dateDebut, String dateFin);
    
    /**
     * Récupère la répartition des articles par secteur
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données de répartition par secteur
     */
    Map<String, Object> getArticlesRepartition(String numStruct);
    
    /**
     * Récupère la répartition des articles par secteur avec dates personnalisées
     * @param numStruct Numéro de structure (optionnel)
     * @param dateDebut Date de début au format YYYY-MM-DD
     * @param dateFin Date de fin au format YYYY-MM-DD
     * @return Map contenant les données de répartition par secteur
     */
    Map<String, Object> getArticlesRepartitionByDates(String numStruct, String dateDebut, String dateFin);
    

    /**
     * Récupère les métriques clés pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les métriques globales (marchés actifs, fournisseurs, articles, valeur totale)
     */
    Map<String, Object> getMetriquesGlobales(String numStruct);
    
    /**
     * Récupère les métriques clés pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les métriques clés
     */
    Map<String, Object> getMetriquesCles(String numStruct);
    
    /**
     * Récupère les tendances des métriques clés sur une période donnée
     * @param numStruct Numéro de structure (optionnel)
     * @param mois Nombre de mois pour calculer les tendances
     * @return Map contenant les tendances des métriques clés
     */
    Map<String, Object> getTendancesMetriques(String numStruct, int mois);
    
    /**
     * Récupère les données de performance par fournisseur
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données de performance
     */
    Map<String, Object> getPerformanceFournisseurs(String numStruct);
    
    /**
     * Export des données en PDF avec filtrage par période
     * @param numStruct Numéro de structure (optionnel)
     * @param type Type de données à exporter
     * @param dateDebut Date de début au format YYYY-MM-DD (optionnel)
     * @param dateFin Date de fin au format YYYY-MM-DD (optionnel)
     * @return Données PDF en bytes
     */
    byte[] exportToPDF(String numStruct, String type, String dateDebut, String dateFin);
    
    /**
     * Export des données en Excel avec filtrage par période
     * @param numStruct Numéro de structure (optionnel)
     * @param type Type de données à exporter
     * @param dateDebut Date de début au format YYYY-MM-DD (optionnel)
     * @param dateFin Date de fin au format YYYY-MM-DD (optionnel)
     * @return Données Excel en bytes
     */
    byte[] exportToExcel(String numStruct, String type, String dateDebut, String dateFin);

    // ========== NOUVELLES MÉTHODES POUR STATISTIQUES GÉNÉRALES ==========

    /**
     * Récupère les statistiques complètes des articles
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant toutes les statistiques des articles
     */
    Map<String, Object> getStatistiquesArticlesComplet(String numStruct);

    /**
     * Récupère les statistiques complètes des fournisseurs
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant toutes les statistiques des fournisseurs
     */
    Map<String, Object> getStatistiquesFournisseursComplet(String numStruct);

    // Nouveaux indicateurs
    Map<String, Object> getArticlesBySecteur(String numStruct);
    Map<String, Object> getDecomptesByType(String numStruct);


    /**
     * Récupère toutes les statistiques générales en une seule fois
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant toutes les statistiques générales
     */
    Map<String, Object> getStatistiquesGenerales(String numStruct);

    /**
     * Récupère les détails des marchés avec leurs fournisseurs et banques
     * @param numStruct Numéro de structure (optionnel)
     * @param page Numéro de page
     * @param size Taille de la page
     * @param filterName Filtre par nom
     * @param filterMinAmount Montant minimum
     * @return Map contenant les données détaillées des marchés
     */
    Map<String, Object> getMarchesDetailles(String numStruct, int page, int size,
                                           String filterName, Double filterMinAmount);

    /**
     * Récupère la liste des fournisseurs qui ont des marchés (via numFourn)
     * @param numStruct Numéro de structure (optionnel)
     * @param page Numéro de page
     * @param size Taille de la page
     * @param filterName Filtre par nom du fournisseur
     * @return Map contenant les fournisseurs avec nombre et montant total de marchés
     */
    Map<String, Object> getFournisseursAvecMarches(String numStruct, int page, int size, String filterName, Double filterMinAmount);
    
    /**
     * Récupère les informations complètes d'un fournisseur par son numéro
     * @param numFourn Numéro du fournisseur
     * @return Map contenant toutes les informations du fournisseur
     */
    Map<String, Object> getFournisseurComplet(String numFourn);
    
    /**
     * Récupère les articles les plus demandés avec filtrage avancé
     * @param numStruct Numéro de structure (optionnel)
     * @param filterSecteur Filtre par secteur
     * @param filterFamille Filtre par famille
     * @param filterStatut Filtre par statut (Actif/Inactif)
     * @param filterTvaMin TVA minimum
     * @param filterTvaMax TVA maximum
     * @return Map contenant les articles filtrés
     */
    Map<String, Object> getArticlesPlusDemandes(String numStruct, String filterSecteur, 
                                               String filterFamille, String filterStatut, 
                                               Double filterTvaMin, Double filterTvaMax);
    
    /**
     * Récupère les articles les plus demandés avec pagination et filtrage avancé
     * @param numStruct Numéro de structure (optionnel)
     * @param page Numéro de page
     * @param size Taille de la page
     * @param filterSecteur Filtre par secteur
     * @param filterFamille Filtre par famille
     * @param filterStatut Filtre par statut (Actif/Inactif)
     * @param filterTvaMin TVA minimum
     * @param filterTvaMax TVA maximum
     * @return Map contenant les articles filtrés avec pagination
     */
    Map<String, Object> getArticlesPlusDemandes(String numStruct, int page, int size,
                                               String filterSecteur, String filterFamille, 
                                               String filterStatut, Double filterTvaMin, 
                                               Double filterTvaMax);
    
    /**
     * Récupère le top des fournisseurs par volume d'articles
     * @param numStruct Numéro de structure (optionnel)
     * @param limit Nombre de fournisseurs à récupérer
     * @return Map contenant les fournisseurs avec leur volume d'articles
     */
    Map<String, Object> getTopFournisseursVolume(String numStruct, int limit);
    
    /**
     * Récupère l'évolution des décomptes par mois
     * @param numStruct Numéro de structure (optionnel)
     * @param months Nombre de mois à analyser
     * @return Map contenant l'évolution des décomptes
     */
    Map<String, Object> getEvolutionDecomptes(String numStruct, int months);
    
    /**
     * Génère des étiquettes de mois pour un contexte donné
     * @param context Contexte d'utilisation
     * @param months Nombre de mois à générer
     * @return Liste des étiquettes de mois
     */
    List<String> generateMonthLabels(String context, int months);
    
    /**
     * Récupère la répartition des fournisseurs par période (12 derniers mois par défaut)
     * @param limit Nombre de fournisseurs à récupérer
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant la répartition des fournisseurs
     */
    Map<String, Object> getFournisseursRepartitionPeriode(int limit, String numStruct);
    
    /**
     * Récupère la répartition des régions par période (12 derniers mois par défaut)
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant la répartition des régions
     */
    Map<String, Object> getRegionsRepartitionPeriode(String numStruct);
    
    /**
     * Récupère la répartition des articles par secteur par période (12 derniers mois par défaut)
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant la répartition des articles par secteur
     */
    Map<String, Object> getArticlesRepartitionPeriode(String numStruct);

    // ========== NOUVELLES MÉTHODES POUR ENDPOINTS MANQUANTS ==========

    /**
     * Récupère les statistiques des garanties
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les statistiques des garanties
     */
    Map<String, Object> getStatistiquesGaranties(String numStruct);

    /**
     * Récupère les statistiques des pénalités
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les statistiques des pénalités
     */
    Map<String, Object> getStatistiquesPenalites(String numStruct);

    /**
     * Récupère les tendances générales
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les tendances générales
     */
    Map<String, Object> getTendances(String numStruct);

    /**
     * Récupère les données de performance
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données de performance
     */
    Map<String, Object> getPerformance(String numStruct);

    /**
     * Récupère les notifications
     * @return Map contenant les notifications
     */
    Map<String, Object> getNotifications();
}

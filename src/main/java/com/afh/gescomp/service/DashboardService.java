package com.afh.gescomp.service;

import java.util.Map;

public interface DashboardService {

    /**
     * Récupère les statistiques globales pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les statistiques (nombre de fournisseurs, articles, marchés, etc.)
     */
    Map<String, Object> getDashboardStats(String numStruct);

    /**
     * Récupère l'évolution des marchés par mois
     * @param numStruct Numéro de structure (optionnel)
     * @param months Nombre de mois à récupérer
     * @return Map contenant les données pour le graphique d'évolution
     */
    Map<String, Object> getMarchesEvolutionByMonth(String numStruct, int months);

    /**
     * Récupère les top fournisseurs
     * @param numStruct Numéro de structure (optionnel)
     * @param limit Nombre de fournisseurs à récupérer
     * @return Map contenant les données des top fournisseurs
     */
    Map<String, Object> getTopFournisseurs(String numStruct, int limit);

    /**
     * Récupère les activités récentes
     * @param numStruct Numéro de structure (optionnel)
     * @param limit Nombre d'activités à récupérer
     * @return Map contenant les activités récentes
     */
    Map<String, Object> getRecentActivities(String numStruct, int limit);

    /**
     * Récupère le statut du système
     * @return Map contenant les informations de statut du système
     */
    Map<String, Object> getSystemStatus();

    // ========== NOUVELLES MÉTHODES POUR LES WIDGETS ==========

    /**
     * Récupère les données des pénalités pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données des pénalités
     */
    Map<String, Object> getPenalitesData(String numStruct);

    /**
     * Récupère les données des garanties pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données des garanties
     */
    Map<String, Object> getGarantiesData(String numStruct);

    /**
     * Récupère les données des décomptes pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données des décomptes
     */
    Map<String, Object> getDecomptesData(String numStruct);

    /**
     * Récupère les données des étapes de marchés pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données des étapes
     */
    Map<String, Object> getEtapesData(String numStruct);

    /**
     * Récupère les données sectorielles pour le dashboard
     * @param numStruct Numéro de structure (optionnel)
     * @return Map contenant les données sectorielles
     */
    Map<String, Object> getSectoriellesData(String numStruct);
}

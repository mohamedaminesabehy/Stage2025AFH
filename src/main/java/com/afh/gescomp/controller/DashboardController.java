package com.afh.gescomp.controller;

import com.afh.gescomp.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * Récupère les statistiques globales pour le dashboard
     */
    @RequestMapping(value = "/stats", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> stats = dashboardService.getDashboardStats(numStruct);
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les données pour le graphique d'évolution des marchés par mois
     */
    @RequestMapping(value = "/marches-evolution", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getMarchesEvolution(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "12") int months) {
        Map<String, Object> evolution = dashboardService.getMarchesEvolutionByMonth(numStruct, months);
        return ResponseEntity.ok(evolution);
    }

    /**
     * Récupère les top fournisseurs pour le graphique
     */
    @RequestMapping(value = "/top-fournisseurs", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getTopFournisseurs(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "5") int limit) {
        Map<String, Object> topFournisseurs = dashboardService.getTopFournisseurs(numStruct, limit);
        return ResponseEntity.ok(topFournisseurs);
    }

    /**
     * Récupère les activités récentes
     */
    @RequestMapping(value = "/recent-activities", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getRecentActivities(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> activities = dashboardService.getRecentActivities(numStruct, limit);
        return ResponseEntity.ok(activities);
    }

    /**
     * Récupère le statut du système
     */
    @RequestMapping(value = "/system-status", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = dashboardService.getSystemStatus();
        return ResponseEntity.ok(status);
    }

    // ========== NOUVEAUX ENDPOINTS POUR LES WIDGETS ==========

    /**
     * Récupère les données des pénalités pour le dashboard
     */
    @RequestMapping(value = "/penalites", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getPenalitesData(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> penalites = dashboardService.getPenalitesData(numStruct);
        return ResponseEntity.ok(penalites);
    }

    /**
     * Récupère les données des garanties pour le dashboard
     */
    @RequestMapping(value = "/garanties", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getGarantiesData(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> garanties = dashboardService.getGarantiesData(numStruct);
        return ResponseEntity.ok(garanties);
    }

    /**
     * Récupère les données des décomptes pour le dashboard
     */
    @RequestMapping(value = "/decomptes", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getDecomptesData(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> decomptes = dashboardService.getDecomptesData(numStruct);
        return ResponseEntity.ok(decomptes);
    }

    /**
     * Récupère les données des étapes de marchés pour le dashboard
     */
    @RequestMapping(value = "/etapes", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getEtapesData(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> etapes = dashboardService.getEtapesData(numStruct);
        return ResponseEntity.ok(etapes);
    }

    /**
     * Récupère les données sectorielles pour le dashboard
     */
    @RequestMapping(value = "/sectorielles", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getSectoriellesData(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> sectorielles = dashboardService.getSectoriellesData(numStruct);
        return ResponseEntity.ok(sectorielles);
    }
}

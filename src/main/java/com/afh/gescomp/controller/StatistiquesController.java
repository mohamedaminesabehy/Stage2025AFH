package com.afh.gescomp.controller;

import com.afh.gescomp.service.StatistiquesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/statistiques")
public class StatistiquesController {

    @Autowired
    private StatistiquesService statistiquesService;

    /**
     * Récupère les données détaillées des fournisseurs avec leurs statistiques
     */
    @RequestMapping(value = "/fournisseurs", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getFournisseursStatistiques(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String filterName,
            @RequestParam(required = false) Double filterMinAmount,
            @RequestParam(required = false) Boolean filterHasPenalites) {
        
        Map<String, Object> stats = statistiquesService.getFournisseursStatistiques(
            numStruct, page, size, filterName, filterMinAmount, filterHasPenalites);
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les données détaillées des articles avec leurs statistiques
     */
    @RequestMapping(value = "/articles", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getArticlesStatistiques(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Map<String, Object> stats = statistiquesService.getArticlesStatistiques(numStruct, page, size);
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère l'évolution des marchés par période
     */
    @RequestMapping(value = "/marches-evolution", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getMarchesEvolution(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "12months") String period) {
        
        Map<String, Object> evolution = statistiquesService.getMarchesEvolutionByPeriod(numStruct, period);
        return ResponseEntity.ok(evolution);
    }
    
    /**
     * Récupère l'évolution des marchés par dates personnalisées
     */
    @RequestMapping(value = "/marches-evolution-dates", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getMarchesEvolutionParDates(
            @RequestParam(required = false) String numStruct,
            @RequestParam String dateDebut,
            @RequestParam String dateFin) {
        
        Map<String, Object> evolution = statistiquesService.getMarchesEvolutionByDates(numStruct, dateDebut, dateFin);
        return ResponseEntity.ok(evolution);
    }

    /**
     * Récupère la répartition des fournisseurs par nombre de marchés
     */
    @RequestMapping(value = "/fournisseurs-repartition", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getFournisseursRepartition(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "5") int limit) {
        
        Map<String, Object> repartition = statistiquesService.getFournisseursRepartition(numStruct, limit);
        return ResponseEntity.ok(repartition);
    }
    
    /**
     * Récupère la répartition des fournisseurs par nombre de marchés avec dates personnalisées
     */
    @RequestMapping(value = "/fournisseurs-repartition-dates", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getFournisseursRepartitionParDates(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam String dateDebut,
            @RequestParam String dateFin) {
        
        Map<String, Object> repartition = statistiquesService.getFournisseursRepartitionByDates(numStruct, limit, dateDebut, dateFin);
        return ResponseEntity.ok(repartition);
    }

    /**
     * Récupère la répartition des marchés par région
     */
    @RequestMapping(value = "/regions-repartition", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getRegionsRepartition(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> repartition = statistiquesService.getRegionsRepartition(numStruct);
        return ResponseEntity.ok(repartition);
    }
    
    /**
     * Récupère la répartition des marchés par région avec dates personnalisées
     */
    @RequestMapping(value = "/regions-repartition-dates", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getRegionsRepartitionParDates(
            @RequestParam(required = false) String numStruct,
            @RequestParam String dateDebut,
            @RequestParam String dateFin) {
        
        Map<String, Object> repartition = statistiquesService.getRegionsRepartitionByDates(numStruct, dateDebut, dateFin);
        return ResponseEntity.ok(repartition);
    }

    /**
     * Récupère la répartition des articles par secteur
     */
    @RequestMapping(value = "/articles-repartition", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getArticlesRepartition(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> repartition = statistiquesService.getArticlesRepartition(numStruct);
        return ResponseEntity.ok(repartition);
    }
    
    /**
     * Récupère la répartition des articles par secteur avec dates personnalisées
     */
    @RequestMapping(value = "/articles-repartition-dates", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getArticlesRepartitionParDates(
            @RequestParam(required = false) String numStruct,
            @RequestParam String dateDebut,
            @RequestParam String dateFin) {
        
        Map<String, Object> repartition = statistiquesService.getArticlesRepartitionByDates(numStruct, dateDebut, dateFin);
        return ResponseEntity.ok(repartition);
    }


    /**
     * Récupère les métriques clés pour le dashboard
     */
    @RequestMapping(value = "/metriques", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getMetriquesCles(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> metriques = statistiquesService.getMetriquesCles(numStruct);
        return ResponseEntity.ok(metriques);
    }
    
    /**
     * Récupère les tendances des métriques clés
     */
    @RequestMapping(value = "/metriques/tendances", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getTendancesMetriques(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "3") int mois) {
        
        Map<String, Object> tendances = statistiquesService.getTendancesMetriques(numStruct, mois);
        return ResponseEntity.ok(tendances);
    }

    /**
     * Récupère les données de performance par fournisseur
     */
    @RequestMapping(value = "/performance-fournisseurs", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getPerformanceFournisseurs(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> performance = statistiquesService.getPerformanceFournisseurs(numStruct);
        return ResponseEntity.ok(performance);
    }

    /**
     * Export des données en PDF avec filtrage par période
     */
    @RequestMapping(value = "/export/pdf", method = RequestMethod.GET)
    public ResponseEntity<byte[]> exportToPDF(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "marches") String type,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {
        
        byte[] pdfData = statistiquesService.exportToPDF(numStruct, type, dateDebut, dateFin);
        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=statistiques_marches.pdf")
                .body(pdfData);
    }

    /**
     * Export des données en Excel avec filtrage par période
     */
    @RequestMapping(value = "/export/excel", method = RequestMethod.GET)
    public ResponseEntity<byte[]> exportToExcel(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "marches") String type,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {

        byte[] excelData = statistiquesService.exportToExcel(numStruct, type, dateDebut, dateFin);
        return ResponseEntity.ok()
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .header("Content-Disposition", "attachment; filename=statistiques_marches.xlsx")
                .body(excelData);
    }

    /**
     * Endpoint générique pour l'export
     */
    @RequestMapping(value = "/export", method = RequestMethod.GET)
    public ResponseEntity<byte[]> exportGeneric(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "marches") String type,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {

        byte[] data;
        if ("excel".equalsIgnoreCase(format)) {
            data = statistiquesService.exportToExcel(numStruct, type, dateDebut, dateFin);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .header("Content-Disposition", "attachment; filename=statistiques_marches.xlsx")
                    .body(data);
        } else {
            data = statistiquesService.exportToPDF(numStruct, type, dateDebut, dateFin);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=statistiques_marches.pdf")
                    .body(data);
        }
    }

    // ========== NOUVEAUX ENDPOINTS POUR STATISTIQUES GÉNÉRALES ==========

    /**
     * Récupère les statistiques complètes des articles
     */
    @RequestMapping(value = "/articles-complet", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getStatistiquesArticlesComplet(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> stats = statistiquesService.getStatistiquesArticlesComplet(numStruct);
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les statistiques complètes des fournisseurs
     */
    @RequestMapping(value = "/fournisseurs-complet", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getStatistiquesFournisseursComplet(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> stats = statistiquesService.getStatistiquesFournisseursComplet(numStruct);
        return ResponseEntity.ok(stats);
    }


    /**
     * Récupère toutes les statistiques générales en une seule fois
     */
    @RequestMapping(value = "/generales", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getStatistiquesGenerales(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> stats = statistiquesService.getStatistiquesGenerales(numStruct);
        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère les données détaillées des marchés avec leurs fournisseurs et banques
     */
    @RequestMapping(value = "/marches-detailles", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getMarchesDetailles(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String filterName,
            @RequestParam(required = false) Double filterMinAmount) {

        Map<String, Object> marches = statistiquesService.getMarchesDetailles(
            numStruct, page, size, filterName, filterMinAmount);
        return ResponseEntity.ok(marches);
    }

    /**
     * Fournisseurs avec marchés (liste paginée)
     */
    @RequestMapping(value = "/fournisseurs-avec-marches", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getFournisseursAvecMarches(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String filterName,
            @RequestParam(required = false) Double filterMinAmount) {
        Map<String, Object> data = statistiquesService.getFournisseursAvecMarches(numStruct, page, size, filterName, filterMinAmount);
        return ResponseEntity.ok(data);
    }


    /**
     * Récupère les informations complètes d'un fournisseur
     */
    @RequestMapping(value = "/fournisseur-complet/{numFourn}", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getFournisseurComplet(@PathVariable String numFourn) {
        
        Map<String, Object> fournisseur = statistiquesService.getFournisseurComplet(numFourn);
        return ResponseEntity.ok(fournisseur);
    }

    /**
     * Récupère les articles les plus demandés avec filtrage avancé
     */
    @RequestMapping(value = "/articles-plus-demandes", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getArticlesPlusDemandes(
            @RequestParam(required = false) String numStruct,
            @RequestParam(required = false) String filterSecteur,
            @RequestParam(required = false) String filterFamille,
            @RequestParam(required = false) String filterStatut,
            @RequestParam(required = false) Double filterTvaMin,
            @RequestParam(required = false) Double filterTvaMax) {
        
        Map<String, Object> articles = statistiquesService.getArticlesPlusDemandes(
            numStruct, filterSecteur, filterFamille, filterStatut, filterTvaMin, filterTvaMax);
        return ResponseEntity.ok(articles);
    }

    /**
     * Récupère la répartition des articles par secteur économique
     */
    @RequestMapping(value = "/articles-by-secteur", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getArticlesBySecteur(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> statistiques = statistiquesService.getArticlesBySecteur(numStruct);
        return ResponseEntity.ok(statistiques);
    }

    /**
     * Récupère les statistiques des garanties
     */
    @RequestMapping(value = "/garanties", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getStatistiquesGaranties(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> garanties = statistiquesService.getStatistiquesGaranties(numStruct);
        return ResponseEntity.ok(garanties);
    }

    /**
     * Récupère les statistiques des pénalités
     */
    @RequestMapping(value = "/penalites", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getStatistiquesPenalites(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> penalites = statistiquesService.getStatistiquesPenalites(numStruct);
        return ResponseEntity.ok(penalites);
    }

    /**
     * Récupère les tendances générales
     */
    @RequestMapping(value = "/tendances", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getTendances(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> tendances = statistiquesService.getTendances(numStruct);
        return ResponseEntity.ok(tendances);
    }

    /**
     * Récupère les données de performance
     */
    @RequestMapping(value = "/performance", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getPerformance(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> performance = statistiquesService.getPerformance(numStruct);
        return ResponseEntity.ok(performance);
    }

    /**
     * Récupère les notifications
     */
    @RequestMapping(value = "/notifications", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getNotifications() {
        
        Map<String, Object> notifications = statistiquesService.getNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Récupère l'évolution des décomptes par type
     */
    @RequestMapping(value = "/decomptes-by-type", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getDecomptesByType(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> statistiques = statistiquesService.getDecomptesByType(numStruct);
        return ResponseEntity.ok(statistiques);
    }

    /**
     * Récupère l'évolution des décomptes par mois
     */
    @RequestMapping(value = "/evolution-decomptes", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getEvolutionDecomptes(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "12") int months) {
        
        Map<String, Object> evolution = statistiquesService.getEvolutionDecomptes(numStruct, months);
        return ResponseEntity.ok(evolution);
    }

    /**
     * Récupère le top des fournisseurs par volume d'articles
     */
    @RequestMapping(value = "/top-fournisseurs-volume", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getTopFournisseursVolume(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "10") int limit) {
        
        Map<String, Object> topFournisseurs = statistiquesService.getTopFournisseursVolume(numStruct, limit);
        return ResponseEntity.ok(topFournisseurs);
    }

    /**
     * Récupère les articles plus demandés avec pagination
     */
    @RequestMapping(value = "/articles-plus-demandes-paginated", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getArticlesPlusDemandesPaginated(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String filterSecteur,
            @RequestParam(required = false) String filterFamille,
            @RequestParam(required = false) String filterStatut,
            @RequestParam(required = false) Double filterTvaMin,
            @RequestParam(required = false) Double filterTvaMax) {
        
        Map<String, Object> articles = statistiquesService.getArticlesPlusDemandes(
            numStruct, page, size, filterSecteur, filterFamille, filterStatut, filterTvaMin, filterTvaMax);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Récupère les métriques globales pour le dashboard
     */
    @RequestMapping(value = "/metriques-globales", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getMetriquesGlobales(
            @RequestParam(required = false) String numStruct) {
        
        Map<String, Object> metriques = statistiquesService.getMetriquesGlobales(numStruct);
        return ResponseEntity.ok(metriques);
    }
    
    /**
     * Alias: Répartition des fournisseurs par période (compat front)
     */
    @RequestMapping(value = "/fournisseurs-repartition-periode", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getFournisseursRepartitionPeriode(
            @RequestParam(required = false) String numStruct,
            @RequestParam(defaultValue = "5") int limit) {
        Map<String, Object> repartition = statistiquesService.getFournisseursRepartition(numStruct, limit);
        return ResponseEntity.ok(repartition);
    }
    
    /**
     * Alias: Répartition des régions par période (compat front)
     */
    @RequestMapping(value = "/regions-repartition-periode", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getRegionsRepartitionPeriode(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> repartition = statistiquesService.getRegionsRepartition(numStruct);
        return ResponseEntity.ok(repartition);
    }
    
    /**
     * Alias: Répartition des articles par secteur (compat front)
     */
    @RequestMapping(value = "/articles-repartition-periode", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> getArticlesRepartitionPeriode(
            @RequestParam(required = false) String numStruct) {
        Map<String, Object> repartition = statistiquesService.getArticlesRepartition(numStruct);
        return ResponseEntity.ok(repartition);
    }


}


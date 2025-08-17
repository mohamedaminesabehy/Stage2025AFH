import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { StatistiquesGlobales } from 'src/app/model/statistiques';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor() { }

  getMockStatistiquesGlobales(): Observable<StatistiquesGlobales> {
    const mockData: StatistiquesGlobales = {
      fournisseurs: {
        total: 7829,
        actifs: 6234,
        nouveaux: 156,
        scorePerformance: 78.5,
        topFournisseurs: [
          {
            id: 7853,
            designation: 'شركة بوزقندة اخوان',
            designationFr: 'STE BOUZGUENDA FRERES',
            nombreMarches: 45,
            montantTotal: 2850000,
            scorePerformance: 92.3,
            adresse: '41 RUE 8600 ZONE INDUSTRIELLE',
            matriculeFisc: '401097398'
          },
          {
            id: 7836,
            designation: 'kbs consulting',
            designationFr: 'KBS CONSULTING',
            nombreMarches: 32,
            montantTotal: 1950000,
            scorePerformance: 87.1,
            adresse: '2 rue ibn khaldoun imm bali 1 etage B14',
            matriculeFisc: '401097381'
          },
          {
            id: 7835,
            designation: 'ELGHOUL MOUHAMED',
            designationFr: 'EL GHOUL MOHAMED',
            nombreMarches: 28,
            montantTotal: 1650000,
            scorePerformance: 84.7,
            adresse: '',
            matriculeFisc: '411090526'
          }
        ],
        repartitionParRegion: [
          { region: 'Tunis', nombre: 2341, pourcentage: 29.9, montantTotal: 15600000 },
          { region: 'Sfax', nombre: 1567, pourcentage: 20.0, montantTotal: 12300000 },
          { region: 'Sousse', nombre: 1234, pourcentage: 15.8, montantTotal: 9800000 },
          { region: 'Ariana', nombre: 987, pourcentage: 12.6, montantTotal: 7500000 },
          { region: 'Autres', nombre: 1700, pourcentage: 21.7, montantTotal: 8900000 }
        ],
        evolutionMensuelle: [
          { mois: 'Jan 2024', valeur: 156, variation: 12, pourcentageVariation: 8.3 },
          { mois: 'Fév 2024', valeur: 143, variation: -13, pourcentageVariation: -8.3 },
          { mois: 'Mar 2024', valeur: 167, variation: 24, pourcentageVariation: 16.8 },
          { mois: 'Avr 2024', valeur: 189, variation: 22, pourcentageVariation: 13.2 },
          { mois: 'Mai 2024', valeur: 201, variation: 12, pourcentageVariation: 6.3 },
          { mois: 'Jun 2024', valeur: 178, variation: -23, pourcentageVariation: -11.4 }
        ]
      },
      marches: {
        total: 2025,
        enCours: 456,
        termines: 1234,
        montantTotal: 125600000,
        montantMoyen: 62000,
        tauxReussite: 87.3,
        delaisMoyens: 45,
        repartitionParType: [
          { type: 'DECOMPTE', nombre: 1523, pourcentage: 75.2, montantTotal: 94500000 },
          { type: 'CONSULTATION', nombre: 312, pourcentage: 15.4, montantTotal: 19800000 },
          { type: 'TRAVAUX', nombre: 190, pourcentage: 9.4, montantTotal: 11300000 }
        ],
        evolutionMontants: [
          { mois: 'Jan 2024', valeur: 18500000, variation: 1200000, pourcentageVariation: 6.9 },
          { mois: 'Fév 2024', valeur: 17300000, variation: -1200000, pourcentageVariation: -6.5 },
          { mois: 'Mar 2024', valeur: 21200000, variation: 3900000, pourcentageVariation: 22.5 },
          { mois: 'Avr 2024', valeur: 23100000, variation: 1900000, pourcentageVariation: 9.0 },
          { mois: 'Mai 2024', valeur: 22800000, variation: -300000, pourcentageVariation: -1.3 },
          { mois: 'Jun 2024', valeur: 22700000, variation: -100000, pourcentageVariation: -0.4 }
        ]
      },
      articles: {
        total: 100332,
        categories: [
          { secteur: 'بنية أساسية', sousSecteur: 'أشغال', famille: 'GAZ', sousFamille: 'RESEAU DE DISTRIBUTION', nombre: 15234, pourcentage: 15.2 },
          { secteur: 'Infrastructure', sousSecteur: 'Travaux', famille: 'ELECTRICITE', sousFamille: 'DISTRIBUTION HTA/BT', nombre: 12456, pourcentage: 12.4 },
          { secteur: 'Equipements', sousSecteur: 'Fournitures', famille: 'MATERIEL', sousFamille: 'OUTILLAGE', nombre: 9876, pourcentage: 9.8 }
        ],
        plusUtilises: [
          {
            numArticle: '0102004000100332',
            designation: 'Travaux de construction de deux chambres à vanne en béton armé',
            designationFr: 'Travaux de construction de deux chambres à vanne en béton armé',
            utilisations: 234,
            montantTotal: 1560000,
            prixMoyen: 6666
          },
          {
            numArticle: '0102004000100331',
            designation: 'Contrôle d\'isolement de la conduite à poser',
            designationFr: 'Contrôle d\'isolement de la conduite à poser',
            utilisations: 189,
            montantTotal: 945000,
            prixMoyen: 5000
          }
        ],
        evolutionPrix: [
          { periode: 'Jan 2024', prixMoyen: 5234, variation: 2.3 },
          { periode: 'Fév 2024', prixMoyen: 5156, variation: -1.5 },
          { periode: 'Mar 2024', prixMoyen: 5389, variation: 4.5 },
          { periode: 'Avr 2024', prixMoyen: 5456, variation: 1.2 },
          { periode: 'Mai 2024', prixMoyen: 5523, variation: 1.2 },
          { periode: 'Jun 2024', prixMoyen: 5498, variation: -0.5 }
        ],
        repartitionTVA: [
          { tauxTVA: 19, nombre: 67234, pourcentage: 67.0, montantTotal: 89500000 },
          { tauxTVA: 13, nombre: 23456, pourcentage: 23.4, montantTotal: 23400000 },
          { tauxTVA: 7, nombre: 6789, pourcentage: 6.8, montantTotal: 5600000 },
          { tauxTVA: 0, nombre: 2853, pourcentage: 2.8, montantTotal: 1200000 }
        ]
      },
      tendances: {
        croissanceMarches: 12.5,
        croissanceFournisseurs: 8.3,
        efficaciteOperationnelle: 87.2,
        satisfactionClient: 82.1,
        predictions: [
          { periode: 'Jul 2024', type: 'Marchés', valeurPredite: 24500000, confiance: 85 },
          { periode: 'Aug 2024', type: 'Marchés', valeurPredite: 25200000, confiance: 82 },
          { periode: 'Sep 2024', type: 'Marchés', valeurPredite: 24800000, confiance: 78 }
        ]
      },
      performance: {
        scoreGlobal: 84.7,
        indicateurs: [
          { nom: 'Efficacité Processus', valeur: 87.3, objectif: 90, unite: '%', tendance: 'up', couleur: 'primary' },
          { nom: 'Respect Délais', valeur: 82.1, objectif: 85, unite: '%', tendance: 'stable', couleur: 'accent' },
          { nom: 'Qualité Livraisons', valeur: 91.5, objectif: 95, unite: '%', tendance: 'up', couleur: 'primary' },
          { nom: 'Satisfaction Client', valeur: 78.9, objectif: 80, unite: '%', tendance: 'down', couleur: 'warn' },
          { nom: 'Rentabilité', valeur: 85.2, objectif: 88, unite: '%', tendance: 'stable', couleur: 'primary' }
        ],
        alertes: [
          {
            id: 'alert-001',
            type: 'warning',
            titre: 'Délais de livraison en retard',
            message: 'Plusieurs marchés accusent des retards de livraison supérieurs à 15 jours.',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
            priorite: 'haute'
          },
          {
            id: 'alert-002',
            type: 'info',
            titre: 'Nouveau fournisseur certifié',
            message: 'Un nouveau fournisseur a été certifié et ajouté à la base de données.',
            date: new Date(Date.now() - 6 * 60 * 60 * 1000), // Il y a 6 heures
            priorite: 'basse'
          },
          {
            id: 'alert-003',
            type: 'error',
            titre: 'Dépassement budget marché',
            message: 'Le marché #2025019 a dépassé son budget initial de 15%.',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
            priorite: 'haute'
          }
        ],
        recommandations: [
          {
            id: 'rec-001',
            titre: 'Optimiser les processus de validation',
            description: 'Mettre en place un système de validation automatisé pour réduire les délais de traitement.',
            impact: 'haute',
            effort: 'moyen',
            categorie: 'Processus'
          },
          {
            id: 'rec-002',
            titre: 'Formation équipes projet',
            description: 'Organiser des formations pour améliorer la gestion de projet et le respect des délais.',
            impact: 'moyenne',
            effort: 'faible',
            categorie: 'Formation'
          },
          {
            id: 'rec-003',
            titre: 'Mise à jour système de suivi',
            description: 'Moderniser le système de suivi des marchés pour une meilleure visibilité en temps réel.',
            impact: 'haute',
            effort: 'eleve',
            categorie: 'Technologie'
          }
        ]
      }
    };

    return of(mockData);
  }
}

package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.SousSecteur;

import java.util.List;

public interface SousSecteurService {
     List<SousSecteur>getSousSecteursBySecteur(Short numSectEco);
     Short getNumSSecteurByDesignation(String designation);
     Short findNumSSectEcoByNumSectEcoAndDesignation(String designation, Short numSectEco);
}

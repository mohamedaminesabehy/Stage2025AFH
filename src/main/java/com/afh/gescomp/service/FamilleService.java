package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.Famille;

import java.util.List;

public interface FamilleService {
    List<Famille>getFamillesBySousSecteur(Short numSectEco, Short numSSectEco);
    Short getFamilleByDesignation(String designation, Short numSectEco, Short numSSectEco);
}

package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.Article;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.payload.response.MontantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MarcheService {
    List<Marche> findAllMarches();
    Page<Marche> getAllMarches(Pageable Pageable, String filter, String designation, String fournisseurDesignation, String numStruct, String numFourn);
    void save(Marche marcheRequest);
    Marche findMarcheByNumMarche(Long numMarche);
    void deleteMarche(Marche marche);
    Marche updateMarche(Long id, Marche marcheDetails);
    String getMarcheSuivant(String sExercice);
    MontantResponse calculateMontants(Long numMarche);
    Page<Marche> getMarches(Pageable pageable, String numStruct);
    Page<Marche> searchMarches(String searchTerm, Pageable pageable, String numStruct);
    List<Marche> getAllMarchesNoPaginAndSearch(String numStruct);
    
    /**
     * Récupère tous les marchés associés à un fournisseur
     * @param numFourn Numéro du fournisseur
     * @return Liste des marchés du fournisseur
     */
    List<Marche> getMarchesByFournisseur(String numFourn);
}

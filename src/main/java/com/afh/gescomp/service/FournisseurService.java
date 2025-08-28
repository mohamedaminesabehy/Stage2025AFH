package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.Fournisseur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FournisseurService {
     void save(Fournisseur fournisseur);
     Fournisseur findById(Long id);
     void deleteFournisseur(Fournisseur fournisseur);
     List<Fournisseur> findAllByOrderByIdDesc();
     Page<Fournisseur> getAllFournisseurs(Pageable pageable);
     Page<Fournisseur> getAllFournisseursByNumFourn(Pageable pageable, String fournisseurDesignation, String designation);
     Page<Fournisseur> searchFournisseur(Pageable pageable, String filter);
     Page<Fournisseur> getFournisseurs(int page, int size);
     
     /**
      * Génère un PDF contenant les détails d'un fournisseur et ses marchés associés
      * @param numFourn Numéro du fournisseur
      * @return Données PDF en bytes
      */
     byte[] generateFournisseurDetailsPDF(String numFourn);
}

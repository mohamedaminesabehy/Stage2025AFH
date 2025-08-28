package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.payload.response.MontantResponse;
import com.afh.gescomp.repository.primary.FournisseurRepository;
import com.afh.gescomp.repository.primary.MarcheRepository;
import com.afh.gescomp.service.MarcheService;
import javax.persistence.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Service
public class MarcheServiceImpl implements MarcheService {

    @Override
    public List<Marche> getMarchesByFournisseur(String numFourn) {
        if (numFourn == null || numFourn.isEmpty()) {
            return Collections.emptyList();
        }
        return marcheRepository.findByFournisseurNumFourn(numFourn);
    }


    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private MarcheRepository marcheRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Override
    public List<Marche> findAllMarches() {
        return marcheRepository.findAll();
    }

    @Override
    public Page<Marche> getAllMarches(Pageable pageable, String filter, String designation, String fournisseurDesignation, String numStruct, String numFourn) {
        Pageable sortedPageable = new PageRequest(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );

        Page<Marche> marches;
        Long numMarche = null;

        // Tentez de convertir le filtre en Long
        if (filter != null && !filter.isEmpty()) {
            try {
                numMarche = Long.valueOf(filter);
            } catch (NumberFormatException e) {
                // Ignorer la conversion si ce n'est pas un Long
            }
        }

        // Filtrer selon les combinaisons
        if (numFourn != null && !numFourn.isEmpty()) {
            // Si numFourn est fourni, filtrer par numFourn
            marches = marcheRepository.findByNumFourn(numFourn, numStruct, sortedPageable);
        } else if (numMarche != null && (designation != null && !designation.isEmpty()) && (fournisseurDesignation != null && !fournisseurDesignation.isEmpty())) {
            // Combinaison : numMarche, designation, et fournisseurDesignation
            marches = marcheRepository.findByIdAndDesignationContainingAndIdFourn_DesignationContaining(numMarche, designation, fournisseurDesignation, numStruct, sortedPageable);
        } else if (numMarche != null && (designation != null && !designation.isEmpty())) {
            // Combinaison : numMarche et designation
            marches = marcheRepository.findByIdOrDesignationContaining(numMarche, designation, numStruct, sortedPageable);
        } else if (numMarche != null && (fournisseurDesignation != null && !fournisseurDesignation.isEmpty())) {
            // Combinaison : numMarche et fournisseurDesignation
            marches = marcheRepository.findByIdAndIdFourn_DesignationContaining(numMarche, fournisseurDesignation, numStruct, sortedPageable);
        } else if (designation != null && !designation.isEmpty() && (fournisseurDesignation != null && !fournisseurDesignation.isEmpty())) {
            // Combinaison : designation et fournisseurDesignation
            marches = marcheRepository.findByDesignationContainingAndIdFourn_DesignationContaining(designation, fournisseurDesignation, numStruct, sortedPageable);
        } else if (numMarche != null) {
            // Si seulement numMarche est fourni
            marches = marcheRepository.findById(numMarche, numStruct, sortedPageable);
        } else if (designation != null && !designation.isEmpty()) {
            // Si seulement designation est fournie
            marches = marcheRepository.findByDesignationContaining(designation, numStruct, sortedPageable);
        } else if (fournisseurDesignation != null && !fournisseurDesignation.isEmpty()) {
            // Si seulement fournisseurDesignation est fournie
            marches = marcheRepository.findByFournisseurDesignation(fournisseurDesignation, numStruct, sortedPageable);
        } else {
            // Aucun filtre, récupérer tous les marchés
            marches = marcheRepository.findAllMarchesWithCustomSorting(sortedPageable,numStruct);
        }

        return marches;
    }

    @Transactional
    @Override
    public void save(Marche marcheRequest) {
        if (marcheRequest.getIdFourn() != null) {
            Fournisseur fournisseur = fournisseurRepository.getOne(marcheRequest.getIdFourn().getId());
            marcheRequest.setNumFourn(fournisseur.getNumFourn());
        }
        String exercice = String.format("%04d", marcheRequest.getExercice());
        String nextNummarche = getMarcheSuivant(exercice);
        marcheRequest.setId(Long.parseLong(nextNummarche));
        marcheRepository.save(marcheRequest);
    }

    @Transactional
    @Override
    public String getMarcheSuivant(String sExercice) {
        String result = "";
        String sql = "SELECT PKG_GENERAL.GET_NUM_MARCHE_SUIVANT(:sExercice) FROM dual";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("sExercice", sExercice);
        return result = (String) query.getSingleResult();
    }

    @Override
    public Marche findMarcheByNumMarche(Long numMarche) {
        return marcheRepository.findById(numMarche);
    }

    @Override
    public void deleteMarche(Marche marche) {
        marcheRepository.delete(marche);
    }

    @Transactional
    @Override
    public Marche updateMarche(Long id, Marche marcheDetails) {
        Marche marche = marcheRepository.findById(id);
        if (marche == null) {
            throw new RuntimeException("Marché non trouvé avec ID: " + id);
        }

        // Sécurisation du fournisseur
        Fournisseur fournInput = marcheDetails.getIdFourn();
        if (fournInput == null || fournInput.getId() == null) {
            throw new RuntimeException("Fournisseur non spécifié.");
        }

        Fournisseur fournisseur = fournisseurRepository.findOneById(fournInput.getId());
        if (fournisseur == null) {
            throw new RuntimeException("Fournisseur introuvable avec ID: " + fournInput.getId());
        }

        // Mise à jour des champs
        marche.setDateCm(marcheDetails.getDateCm());
        marche.setDateConAdmin(marcheDetails.getDateConAdmin());
        marche.setDateEnreg(marcheDetails.getDateEnreg());
        marche.setDateMarche(marcheDetails.getDateMarche());
        marche.setDateNotif(marcheDetails.getDateNotif());
        marche.setDesignation(marcheDetails.getDesignation());
        marche.setDureeContract(marcheDetails.getDureeContract());
        marche.setNumAvMarche(marcheDetails.getNumAvMarche());
        marche.setNumMin(marcheDetails.getNumMin());
        marche.setRib(marcheDetails.getRib());

        // Fournisseur
        marche.setIdFourn(fournisseur);
        marche.setNumFourn(fournisseur.getNumFourn());

        // Autres champs
        marche.setNumBanque(marcheDetails.getNumBanque());
        marche.setTypePFMarche(marcheDetails.getTypePFMarche());
        marche.setIdStructure(marcheDetails.getIdStructure());
        marche.setExPen(marcheDetails.getExPen());
        marche.setPctMaxPenalite(marcheDetails.getPctMaxPenalite());
        marche.setTauxPenJ(marcheDetails.getTauxPenJ());
        marche.setMontantPenJ(marcheDetails.getMontantPenJ());
        marche.setIdModePen(marcheDetails.getIdModePen());
        marche.setPctRetTva(marcheDetails.getPctRetTva());
        marche.setPctRetGar(marcheDetails.getPctRetGar());
        marche.setPctRetIr(marcheDetails.getPctRetIr());
        marche.setPctVdm(marcheDetails.getPctVdm());
        marche.setPctMaxVdm(marcheDetails.getPctMaxVdm());
        marche.setPctTva(marcheDetails.getPctTva());
        marche.setPctRemise(marcheDetails.getPctRemise());
        marche.setPctAvancePay(marcheDetails.getPctAvancePay());
        marche.setDureeAvance(marcheDetails.getDureeAvance());
        marche.setPctRetAv(marcheDetails.getPctRetAv());

        return marcheRepository.save(marche);
    }


    @Transactional
    @Override
    public MontantResponse calculateMontants(Long numMarche) {
        try {
            // Appel de la procédure stockée CAL_MARCHE avec le paramètre numMarche
            String sql = "CALL CAL_MARCHE(:numMarche)";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("numMarche", numMarche);

            // Exécuter la procédure
            query.executeUpdate();

            // Après l'exécution de la procédure, récupérez les montants mis à jour dans la base de données
            // Utilisez une requête pour récupérer les montants mis à jour dans la table "marche"
            String montantMarcheQuery = "SELECT MNT_MARCHE FROM marche WHERE num_marche = :numMarche";
            String montantMarcheApresAvenantQuery = "SELECT MNT_MRC_APRES_AVENANT FROM marche WHERE num_marche = :numMarche";

            BigDecimal montantMarche = (BigDecimal) entityManager.createNativeQuery(montantMarcheQuery)
                    .setParameter("numMarche", numMarche)
                    .getSingleResult();
            BigDecimal montantMarcheApresAvenant = (BigDecimal) entityManager.createNativeQuery(montantMarcheApresAvenantQuery)
                    .setParameter("numMarche", numMarche)
                    .getSingleResult();

            // Retourner une réponse avec les montants calculés
            return new MontantResponse("OK", montantMarche, montantMarcheApresAvenant);
        } catch (Exception e) {
            e.printStackTrace();
            return new MontantResponse("Erreur", BigDecimal.ZERO, BigDecimal.ZERO);
        }
    }

    @Override
    public Page<Marche> getMarches(Pageable pageable, String numStruct) {
        //return marcheRepository.findAll(pageable);
        return marcheRepository.findAllByNumStruct(numStruct, pageable);
    }

    @Override
    public Page<Marche> searchMarches(String searchTerm, Pageable pageable, String numStruct) {
        try {
            Long numMarche = Long.parseLong(searchTerm);
            // Recherche par numéro de marché avec numStruct
            return marcheRepository.findByIdOrDesignationContainingIgnoreCaseAndNumStruct(numMarche, searchTerm, numStruct, pageable);
        } catch (NumberFormatException e) {
            // Si ce n'est pas un nombre, recherche par désignation avec numStruct
            return marcheRepository.findByDesignationContainingIgnoreCaseAndNumStruct(searchTerm, numStruct, pageable);
        }
    }

    @Override
    public List<Marche> getAllMarchesNoPaginAndSearch(String numStruct) {
        return marcheRepository.getAllMarchesNoPaginAndSearch(numStruct);
    }


}

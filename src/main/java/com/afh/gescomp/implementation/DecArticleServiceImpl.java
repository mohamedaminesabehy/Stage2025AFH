package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.DecArticle;
import com.afh.gescomp.model.primary.DecArticleId;
import com.afh.gescomp.payload.request.DecArticleUpdateRequest;
import com.afh.gescomp.payload.response.MontantResponse;
import com.afh.gescomp.repository.primary.DecArticleRepository;
import com.afh.gescomp.service.DecArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class DecArticleServiceImpl implements DecArticleService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private DecArticleRepository decArticleRepository;

    @Override
    public List<DecArticle> getDecArticlesTravaux(Long numMarche, String idLot, Short numPieceFourn, Short numEtape) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPTravaux(numMarche, idLot, numPieceFourn, numEtape);
    }
    //------------------------//
    @Override
    public Page<DecArticle> getDecArticlesTravauxPagin(Long numMarche, String idLot, Short numPieceFourn, Short numEtape, Pageable pageable) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPTravauxPagin(numMarche, idLot, numPieceFourn, numEtape, pageable);
    }
    //---------------//

    @Override
    public List<DecArticle> getDecArticlesAppro(Long numMarche, String idLot, Short numPieceFourn, Short numEtape) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPAppro(numMarche, idLot, numPieceFourn, numEtape);
    }
    //---------------//
    @Override
    public Page<DecArticle> getDecArticlesApproPagin(Long numMarche, String idLot, Short numPieceFourn, Short numEtape, Pageable pageable) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPApproPagin(numMarche, idLot, numPieceFourn, numEtape, pageable);
    }
    //---------------//
    @Override
    public List<DecArticle> patchDecArticlesTravaux(
            Long numMarche,
            String idLot,
            Short numPieceFourn,
            Short numEtape,
            List<DecArticleUpdateRequest> articlesToUpdate) {

        List<DecArticle> existingArticles = decArticleRepository.findDecArticlesByMarcheAndLotAndAPTravaux(numMarche, idLot, numPieceFourn, numEtape);

        // Mettre à jour les champs des articles existants
        for (DecArticleUpdateRequest updatedArticleRequest : articlesToUpdate) {
            // Chercher l'article correspondant dans la base de données
            for (DecArticle existingArticle : existingArticles) {
                if (existingArticle.getId().getIdArticle().equals(updatedArticleRequest.getIdDecArticle().getIdArticle())) {
                    // Mettre à jour les champs du `updatedColumns`
                    if (updatedArticleRequest.getUpdatedColumns().getQuantite() != null) {
                        existingArticle.setQuantite(updatedArticleRequest.getUpdatedColumns().getQuantite());
                    }
                    if (updatedArticleRequest.getUpdatedColumns().getTva() != null) {
                        existingArticle.setTva(updatedArticleRequest.getUpdatedColumns().getTva());
                    }
                    if (updatedArticleRequest.getUpdatedColumns().getPctRea() != null) {
                        existingArticle.setPctRea(updatedArticleRequest.getUpdatedColumns().getPctRea());
                    }
                    // Sauvegarder l'article mis à jour dans la base de données
                    decArticleRepository.save(existingArticle);
                }
            }
        }
        // Retourner les articles mis à jour
        return existingArticles;
    }

    @Override
    public List<DecArticle> patchDecArticlesAppro(
            Long numMarche,
            String idLot,
            Short numPieceFourn,
            Short numEtape,
            List<DecArticleUpdateRequest> articlesToUpdate) {

        List<DecArticle> existingArticles = decArticleRepository.findDecArticlesByMarcheAndLotAndAPAppro(numMarche, idLot, numPieceFourn, numEtape);

        // Mettre à jour les champs des articles existants
        for (DecArticleUpdateRequest updatedArticleRequest : articlesToUpdate) {
            // Chercher l'article correspondant dans la base de données
            for (DecArticle existingArticle : existingArticles) {
                if (existingArticle.getId().getIdArticle().equals(updatedArticleRequest.getIdDecArticle().getIdArticle())) {
                    // Mettre à jour les champs du `updatedColumns`
                    if (updatedArticleRequest.getUpdatedColumns().getQuantite() != null) {
                        existingArticle.setQuantite(updatedArticleRequest.getUpdatedColumns().getQuantite());
                    }
                    if (updatedArticleRequest.getUpdatedColumns().getTva() != null) {
                        existingArticle.setTva(updatedArticleRequest.getUpdatedColumns().getTva());
                    }
                    // Sauvegarder l'article mis à jour dans la base de données
                    decArticleRepository.save(existingArticle);
                }
            }
        }
        // Retourner les articles mis à jour
        return existingArticles;
    }

    @Transactional
    @Override
    public String calculateMontantsFinalDecArticlesOrd(Long numMarche, Short numPieceFourn, Short numEtape) {
        try {
            String sql = "CALL CAL_DEC_ORD(:numMarche, :numPieceFourn, :numEtape)";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("numMarche", numMarche);
            query.setParameter("numPieceFourn", numPieceFourn);
            query.setParameter("numEtape", numEtape);
            // Exécuter la procédure
            query.executeUpdate();

            // Retourner un message de succès
            return "Calcul des montants effectué avec succès";
        } catch (Exception e) {
            // Retourner un message d'erreur
            throw new RuntimeException("Erreur lors du calcul des montants pour le marché: " + numMarche, e);
        }
    }

    @Transactional
    @Override
    public String calculateMontantsFinalDecArticlesLrg(Long numMarche, Short numPieceFourn) {
        try {
            String sql = "CALL CAL_DEC_LRG(:numMarche, :numPieceFourn)";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("numMarche", numMarche);
            query.setParameter("numPieceFourn", numPieceFourn);
            // Exécuter la procédure
            query.executeUpdate();

            // Retourner un message de succès
            return "Calcul des montants effectué avec succès";
        } catch (Exception e) {
            // Retourner un message d'erreur
            throw new RuntimeException("Erreur lors du calcul des montants pour le marché: " + numMarche, e);
        }
    }

    @Override
    public List<DecArticle> getDecArticlesTravauxDecompteLRGfromNetDer(Long numMarche, String idLot, Short numPieceFourn) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPTravauxDecompteLRGfromNetDern(numMarche, idLot, numPieceFourn);
    }

    @Override
    public List<DecArticle> getDecArticlesApproDecompteLRGfromNetDer(Long numMarche, String idLot, Short numPieceFourn) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPApproDecompteLRGfromNetDern(numMarche, idLot, numPieceFourn);
    }

    @Override
    public List<DecArticle> getDecArticlesTravauxDecompte(Long numMarche, String idLot, Short numPieceFourn, Short numDecompte) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPTravauxDecompte(numMarche, idLot, numPieceFourn,numDecompte);
    }

    @Override
    public List<DecArticle> getDecArticlesApproDecompte(Long numMarche, String idLot, Short numPieceFourn, Short numDecompte) {
        return decArticleRepository.findDecArticlesByMarcheAndLotAndAPApproDecompte(numMarche, idLot, numPieceFourn,numDecompte);
    }


}


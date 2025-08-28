package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.DecArticle;
import com.afh.gescomp.payload.request.DecArticleUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DecArticleService {
    List<DecArticle> getDecArticlesTravaux(Long numMarche, String idLot, Short numPieceFourn, Short numEtape);
    //-----------------//
    Page<DecArticle> getDecArticlesTravauxPagin(Long numMarche, String idLot, Short numPieceFourn, Short numEtape, Pageable pageable);
    //-----------------//
    List<DecArticle> getDecArticlesAppro(Long numMarche, String idLot, Short numPieceFourn, Short numEtape);
    //----------------//
    Page<DecArticle> getDecArticlesApproPagin(Long numMarche, String idLot, Short numPieceFourn, Short numEtape, Pageable pageable);
    //----------------//
    List<DecArticle> patchDecArticlesTravaux(Long numMarche, String idLot, Short numPieceFourn, Short numEtape, List<DecArticleUpdateRequest> articlesToUpdate);
    List<DecArticle> patchDecArticlesAppro(Long numMarche, String idLot, Short numPieceFourn, Short numEtape, List<DecArticleUpdateRequest> articlesToUpdate);
    String calculateMontantsFinalDecArticlesOrd(Long numMarche, Short numPieceFourn, Short numEtape);
    List<DecArticle> getDecArticlesTravauxDecompte(Long numMarche, String idLot, Short numPieceFourn, Short numDecompte);
    List<DecArticle> getDecArticlesApproDecompte(Long numMarche, String idLot, Short numPieceFourn, Short numDecompte);
    String calculateMontantsFinalDecArticlesLrg(Long numMarche, Short numPieceFourn);
    List<DecArticle> getDecArticlesTravauxDecompteLRGfromNetDer(Long numMarche, String idLot, Short numPieceFourn);
    List<DecArticle> getDecArticlesApproDecompteLRGfromNetDer(Long numMarche, String idLot, Short numPieceFourn);
}

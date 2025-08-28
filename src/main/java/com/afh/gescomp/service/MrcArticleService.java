package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.MrcArticle;
import com.afh.gescomp.model.primary.MrcArticleId;
import com.afh.gescomp.payload.response.MontantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MrcArticleService {
    List<MrcArticle> findByNumMarcheAndIdLot(Long numMarche, String idLot);
    Page<MrcArticle> findByNumMarcheAndIdLot(Long numMarche, String idLot, Pageable pageable);
    void deleteMrcArticle(String numArticle, Long numMarche, Integer ap, String idLot, Short idArticle );
    MrcArticle findById(Long numMarche, String idLot, String numArticle, Short idArticle, Integer ap);
    void save(MrcArticle mrcArticle);
    List<MrcArticle> saveOrUpdateArticles(List<MrcArticle> mrcArticles);
    MrcArticle findByNumMarcheAndIdLotAndNumArticleAndIdArticle(Long numMarche, String idLot, String numArticle, Short idArticle);
    MrcArticle findByNumMarcheAndIdLotAndIdArticle(Long numMarche, String idLot, Short idArticle);
    Short getMaxIdArticle(Long numMarche, String idLot);
}
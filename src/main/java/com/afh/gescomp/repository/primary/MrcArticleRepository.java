package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.MrcArticle;
import com.afh.gescomp.model.primary.MrcArticleId;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MrcArticleRepository extends JpaRepository<MrcArticle, MrcArticleId> {
    @Query("SELECT COALESCE(MAX(m.id.idArticle), 0) FROM MrcArticle m WHERE m.id.numMarche = :numMarche")
    Short findMaxIdArticleByNumMarche(@Param("numMarche") Long numMarche);

    @Query("SELECT m FROM MrcArticle m WHERE m.id.numMarche = :numMarche AND m.id.idLot = :idLot AND m.id.ap = 1 ORDER BY m.id.idArticle ASC")
        List<MrcArticle> findByNumMarcheAndIdLot(@Param("numMarche") Long numMarche, @Param("idLot") String idLot);

    @Query("SELECT m FROM MrcArticle m WHERE m.id.numMarche = :numMarche AND m.id.idLot = :idLot AND m.id.ap = 1 ORDER BY m.id.idArticle ASC")
    Page<MrcArticle> findByNumMarcheAndIdLot(@Param("numMarche") Long numMarche, @Param("idLot") String idLot, Pageable pageable);

    @Query("SELECT a FROM MrcArticle a WHERE a.id.numMarche = :numMarche AND a.id.idLot = :idLot AND a.id.numArticle = :numArticle AND a.id.idArticle = :idArticle AND a.id.ap = :ap")
    MrcArticle findById(@Param("numMarche") Long numMarche, @Param("idLot") String idLot, @Param("numArticle") String numArticle, @Param("idArticle") Short idArticle, @Param("ap") Integer ap);

    @Query("SELECT a FROM MrcArticle a WHERE a.id.numMarche = :numMarche AND a.id.idLot = :idLot AND a.id.numArticle = :numArticle AND a.id.idArticle = :idArticle AND a.id.ap = 1")
    MrcArticle findByNumMarcheAndIdLotAndNumArticleAndIdArticle(@Param("numMarche") Long numMarche, @Param("idLot") String idLot, @Param("numArticle") String numArticle, @Param("idArticle") Short idArticle);

    @Query("SELECT a FROM MrcArticle a WHERE a.id.numMarche = :numMarche AND a.id.idLot = :idLot AND a.id.idArticle = :idArticle AND a.id.ap = 1")
    MrcArticle findByNumMarcheAndIdLotAndIdArticle(@Param("numMarche") Long numMarche, @Param("idLot") String idLot, @Param("idArticle") Short idArticle);

    @Query("SELECT MAX(ma.id.idArticle) FROM MrcArticle ma WHERE ma.mrcLot.numMarche.id = :numMarche AND ma.mrcLot.id.idLot = :idLot")
    Short findMaxIdArticleByNumMarcheAndIdLot(@Param("numMarche") Long numMarche, @Param("idLot") String idLot);
}
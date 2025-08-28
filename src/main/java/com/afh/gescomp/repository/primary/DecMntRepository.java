package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.DecMnt;
import com.afh.gescomp.model.primary.DecMntId;
import com.afh.gescomp.model.primary.MrcArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DecMntRepository extends JpaRepository<DecMnt, DecMntId> {
    @Query("SELECT a FROM DecMnt a WHERE a.numMarche = :numMarche AND a.numPieceFourn = :numPieceFourn")
    DecMnt findById(@Param("numMarche") Long numMarche, @Param("numPieceFourn") Short numPieceFourn);
    List<DecMnt> findByNumMarcheOrderByNumPieceFournAsc(Long numMarche);
}
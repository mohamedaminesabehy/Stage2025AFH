package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.MrcEtape;
import com.afh.gescomp.model.primary.MrcEtapeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MrcEtapeRepository extends JpaRepository<MrcEtape, MrcEtapeId> {
    List<MrcEtape> findById_NumMarche(Long numMarche);
    @Query("SELECT MAX(e.id.numEtape) FROM MrcEtape e WHERE e.numMarche.id = :numMarche")
    Short findMaxNumEtapeByMarche(@Param("numMarche") Long numMarche);

    @Query("SELECT m FROM MrcEtape m WHERE m.numMarche.id = :numMarche AND m.id.numEtape = :numEtape")
    MrcEtape findByNumMarcheAndNumEtape(@Param("numMarche") Long numMarche,
                                        @Param("numEtape") Short numEtape);
}
package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.DecPenalite;
import com.afh.gescomp.model.primary.DecPenaliteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DecPenaliteRepository extends JpaRepository<DecPenalite, DecPenaliteId> {
    @Query("SELECT MAX(d.id.numPen) FROM DecPenalite d WHERE d.id.numMarche = :numMarche AND d.id.numPieceFourn = :numPieceFourn")
    Long findMaxNumPenForMarcheAndPieceFourn(@Param("numMarche") Long numMarche, @Param("numPieceFourn") Long numPieceFourn);
    DecPenalite findByIdTypePen_IdAndId_NumPieceFournAndIdNumMarche(Long id, Long numPieceFourn, Long numMarche);
}
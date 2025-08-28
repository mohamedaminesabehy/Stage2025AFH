package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.MrcPenalite;
import com.afh.gescomp.model.primary.MrcPenaliteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MrcPenaliteRepository extends JpaRepository<MrcPenalite, MrcPenaliteId> {
    MrcPenalite findMrcPenaliteById_NumMarcheAndId_NumPenAndNumPieceFourn(Long numMarche, Long numPen, Short numPieceFourn);
}
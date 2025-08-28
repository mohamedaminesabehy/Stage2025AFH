package com.afh.gescomp.service;

import com.afh.gescomp.dto.MrcPenaliteDTO;
import com.afh.gescomp.model.primary.MrcPenalite;

public interface MrcPenaliteService {
    MrcPenalite saveOrUpdateMrcPenalite(MrcPenaliteDTO mrcPenaliteDTO);
    MrcPenalite getMrcPenalite(Long numMarche, Long numPen, Short numPieceFourn);
    int getMaxNumPenForMarche(int numMarche);
}

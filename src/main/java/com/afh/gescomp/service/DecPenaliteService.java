package com.afh.gescomp.service;


import com.afh.gescomp.dto.DecPenaliteDTO;
import com.afh.gescomp.model.primary.DecPenalite;

public interface DecPenaliteService {
    DecPenalite saveOrUpdateDecPenalite(DecPenaliteDTO decPenaliteDTOPenalite);
    DecPenalite getDecPenalite(Long numMarche, Long idTypePen, Long numPieceFourn);
}

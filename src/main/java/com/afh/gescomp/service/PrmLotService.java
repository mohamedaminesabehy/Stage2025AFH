package com.afh.gescomp.service;

import com.afh.gescomp.dto.PrmLotDTO;
import com.afh.gescomp.model.primary.PrmLot;

import java.util.List;

public interface PrmLotService {
    List<PrmLotDTO> getPrmLots();
    PrmLot findPrmLotByIdLot(String idLot);
    List<PrmLotDTO> getPrmLotsByMatricule(Integer matricule);
}

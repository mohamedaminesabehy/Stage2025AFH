package com.afh.gescomp.service;

import com.afh.gescomp.dto.MrcLotDto;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.model.primary.MrcLot;
import com.afh.gescomp.model.primary.MrcLotId;

import java.util.List;

public interface MrcLotService {
    List<MrcLot>getMrcLotsByNumMarche(Long numMarche);
    List<MrcLot> saveMrcLots(Long numMarche, List<MrcLotDto> mrcLotDtos);
    void deleteMrcLot(MrcLotId mrcLotId);
    MrcLot findMrcLotByIdLot(String idLot);
    MrcLot getMrcLotsByNumMarcheAndIdLot(Long numMarche, String idLot);
}

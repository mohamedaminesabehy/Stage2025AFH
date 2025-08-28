package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.DecLot;

import java.util.List;

public interface DecLotService {
    List<DecLot> findDecLotByNumMarcheAndNumPieceFournAndIdLot(Long numMarche, Long numPieceFourn, String idLot);
}

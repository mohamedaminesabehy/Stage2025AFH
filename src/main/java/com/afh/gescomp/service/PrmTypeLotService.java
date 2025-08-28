package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.PrmTypeLot;

import java.util.List;

public interface PrmTypeLotService {
    List<PrmTypeLot> getPrmTypeLots();
    String getTypeLotDesignationById(Long id);
    PrmTypeLot findById(Long idTypeLot);
}

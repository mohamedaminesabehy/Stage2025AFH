package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.MrcEtape;
import com.afh.gescomp.model.primary.MrcEtapeId;

import java.util.List;

public interface MrcEtapeService {
    MrcEtape save(MrcEtape mrcEtapeRequest);
    List<MrcEtape> getEtapesForMarche(Long numMarche);
    void delete(MrcEtapeId id);
    MrcEtape findById(Long numMarche, Short numEtape);
    Short getNextNumEtape(Long numMarche);
}

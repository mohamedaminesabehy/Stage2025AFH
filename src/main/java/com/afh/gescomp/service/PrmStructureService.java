package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.PrmStructure;
import com.afh.gescomp.model.primary.PrmTypePayMrc;

import java.util.List;

public interface PrmStructureService {
    List<PrmStructure> getAllPrmStructure();
    PrmStructure getPrmStructureById(String numStruct);
}

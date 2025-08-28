package com.afh.gescomp.implementation;


import com.afh.gescomp.model.primary.PrmStructure;
import com.afh.gescomp.repository.primary.PrmStructureRepository;
import com.afh.gescomp.service.PrmStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrmStructureServiceImpl implements PrmStructureService {

    @Autowired
    private PrmStructureRepository prmStructureRepository;

    @Override
    public List<PrmStructure> getAllPrmStructure() {
        return prmStructureRepository.findAll();
    }

    @Override
    public PrmStructure getPrmStructureById(String numStruct) {
        return prmStructureRepository.findPrmStructureByNumStruct(numStruct);
    }
}

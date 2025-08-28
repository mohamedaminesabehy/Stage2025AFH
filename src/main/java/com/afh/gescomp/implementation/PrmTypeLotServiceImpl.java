package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.PrmTypeLot;
import com.afh.gescomp.repository.primary.PrmTypeLotRepository;
import com.afh.gescomp.service.PrmTypeLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrmTypeLotServiceImpl implements PrmTypeLotService {

    @Autowired
    private PrmTypeLotRepository prmTypeLotRepository;

    @Override
    public List<PrmTypeLot> getPrmTypeLots() {
        return prmTypeLotRepository.findAll();
    }

    @Override
    public String getTypeLotDesignationById(Long id) {
        PrmTypeLot typeLot = prmTypeLotRepository.findOne(id);
        return typeLot != null ? typeLot.getDesignation() : null;
    }

    @Override
    public PrmTypeLot findById(Long idTypeLot) {
        return prmTypeLotRepository.findOne(idTypeLot);
    }
}

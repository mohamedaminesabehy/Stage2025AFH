package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.PrmTypePayMrc;
import com.afh.gescomp.repository.primary.PrmTypePayMrcRepository;
import com.afh.gescomp.service.PrmTypePayMrcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrmTypePayMrcServiceImpl implements PrmTypePayMrcService {

    @Autowired
    private PrmTypePayMrcRepository prmTypePayMrcRepository;
    @Override
    public List<PrmTypePayMrc> getAllPrmTypePayMrc() {
        return prmTypePayMrcRepository.findAll();
    }
}

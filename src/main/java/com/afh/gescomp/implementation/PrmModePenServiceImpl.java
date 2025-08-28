package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.PrmModePen;
import com.afh.gescomp.repository.primary.PrmModePenRepository;
import com.afh.gescomp.service.PrmModePenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrmModePenServiceImpl implements PrmModePenService {

    @Autowired
    private PrmModePenRepository prmModePenRepository;
    @Override
    public List<PrmModePen> getAllPrmModePen() {
        return prmModePenRepository.findAll();
    }
}

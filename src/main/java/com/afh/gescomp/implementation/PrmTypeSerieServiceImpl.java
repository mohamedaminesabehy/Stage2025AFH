package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.PrmTypeSerie;
import com.afh.gescomp.repository.primary.PrmTypeSerieRepository;
import com.afh.gescomp.service.PrmTypeSerieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrmTypeSerieServiceImpl implements PrmTypeSerieService {

    @Autowired
    private PrmTypeSerieRepository prmTypeSerieRepository;

    @Override
    public List<PrmTypeSerie> getPrmTypeSeries() {
        return prmTypeSerieRepository.findAll();
    }
}

package com.afh.gescomp.implementation;


import com.afh.gescomp.model.primary.Secteur;
import com.afh.gescomp.repository.primary.SecteurRepository;
import com.afh.gescomp.service.SecteurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SecteurServiceImpl implements SecteurService {

    @Autowired
    private SecteurRepository secteurRepository;

    @Override
    public List<Secteur> getAllSecteur() {
        return secteurRepository.findAll();
    }

    @Override
    public Short getNumSecteurByDesignation(String designation) {
        return secteurRepository.findNumSectEcoByDesignation(designation);
    }


}

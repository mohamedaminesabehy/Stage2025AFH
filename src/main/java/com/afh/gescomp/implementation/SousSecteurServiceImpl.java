package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.SousSecteur;
import com.afh.gescomp.repository.primary.SecteurRepository;
import com.afh.gescomp.repository.primary.SousSecteurRepository;
import com.afh.gescomp.service.SousSecteurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SousSecteurServiceImpl implements SousSecteurService {
    @Autowired
    private SousSecteurRepository sousSecteurRepository;


    @Override
    public List<SousSecteur> getSousSecteursBySecteur(Short numSectEco) {
        return sousSecteurRepository.findByNumSectEco(numSectEco);
    }

    @Override
    public Short getNumSSecteurByDesignation(String designation) {
        return sousSecteurRepository.findNumSSectEcoByDesignation(designation);
    }

    @Override
    public Short findNumSSectEcoByNumSectEcoAndDesignation(String designation, Short numSectEco) {
        return sousSecteurRepository.findNumSSectEcoByNumSectEcoAndDesignation(designation, numSectEco);
    }

}

package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.SousFamille;
import com.afh.gescomp.repository.primary.SousFamilleRepository;
import com.afh.gescomp.service.SousFamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Service
public class SousFamilleServiceImpl implements SousFamilleService {

    @Autowired
    private SousFamilleRepository sousFamilleRepository;

    @Override
    public List<SousFamille> getSousFamillesByFamille(Short numSectEco, Short numSSectEco, Short numFamille) {
        return sousFamilleRepository.findByNumSectEcoAndNumSSectEcoAndNumFamille(numSectEco,numSSectEco,numFamille);
    }

    @Override
    public List<Short> getSFamilleByDesignation(String designation, Short nvNumSecteur, Short nvNumSSecteur, Short nvNumFamille) {
        return sousFamilleRepository.findSFamilleByDesignation(designation, nvNumSecteur, nvNumSSecteur, nvNumFamille);
    }
}

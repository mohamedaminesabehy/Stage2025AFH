package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.Famille;
import com.afh.gescomp.repository.primary.FamilleRepository;
import com.afh.gescomp.service.FamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FamilleSeviceImpl implements FamilleService {

    @Autowired
    private FamilleRepository familleRepository;

    @Override
    public List<Famille> getFamillesBySousSecteur(Short numSectEco, Short numSSectEco) {
        return familleRepository.findByNumSectEcoAndNumSSectEco(numSectEco,numSSectEco);
    }

    @Override
    public Short getFamilleByDesignation(String designation,Short numSectEco, Short numSSectEco) {
        return familleRepository.findFamilleByDesignation(designation, numSectEco, numSSectEco);
    }
}

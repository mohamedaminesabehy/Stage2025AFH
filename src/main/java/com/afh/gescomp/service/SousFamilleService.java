package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.SousFamille;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface SousFamilleService {
    List<SousFamille>getSousFamillesByFamille(Short numSectEco, Short numSSectEco, Short numFamille);
    List<Short>getSFamilleByDesignation(String designation, Short nvNumSecteur, Short nvNumSSecteur, Short nvNumFamille);
}

package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.SousFamille;
import com.afh.gescomp.service.SousFamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/sous-familles")
public class SousFamilleController {

    @Autowired
    private SousFamilleService sousFamilleService;

    @RequestMapping(value = "/famille/{numSectEco}/{numSSectEco}/{numFamille}", method = RequestMethod.GET)
    public List<SousFamille> getSousFamillesByFamille(@PathVariable Short numSectEco, @PathVariable Short numSSectEco, @PathVariable Short numFamille) {
        return sousFamilleService.getSousFamillesByFamille(numSectEco, numSSectEco, numFamille);
    }


    @RequestMapping(value = "/designation", method = RequestMethod.GET)
    public ResponseEntity<Short> getSFamilleByDesignation(@RequestParam  String designation,
                                                          @RequestParam Short nvNumSecteur,
                                                          @RequestParam Short nvNumSSecteur,
                                                          @RequestParam Short nvNumFamille) {
        List<Short> numSFamilles= sousFamilleService.getSFamilleByDesignation(designation, nvNumSecteur, nvNumSSecteur, nvNumFamille);
        if (numSFamilles.isEmpty()) {
            return ResponseEntity.ok(null) ;
        } else {
            Short numSFamille = numSFamilles.get(0); // Retourner le premier résultat
            return ResponseEntity.ok(numSFamille);
        }
    }

}

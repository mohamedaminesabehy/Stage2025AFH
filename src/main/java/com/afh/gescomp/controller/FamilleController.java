package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Famille;
import com.afh.gescomp.service.FamilleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/familles")
public class FamilleController {

    @Autowired
    private FamilleService familleService;

    @RequestMapping(value = "/sous-secteur/{numSectEco}/{numSSectEco}", method = RequestMethod.GET)
    public List<Famille> getFamillesBySousSecteur(@PathVariable Short numSectEco, @PathVariable Short numSSectEco) {
        return familleService.getFamillesBySousSecteur(numSectEco, numSSectEco);
    }

    @RequestMapping(value = "/designation", method = RequestMethod.GET)
    public ResponseEntity<Short> getFamilleByDesignation(@RequestParam  String designation,
                                                         @RequestParam Short numSectEco,
                                                         @RequestParam Short numSSectEco)
    {
        Short numFamille= familleService.getFamilleByDesignation(designation,numSectEco,numSSectEco);
        if (numFamille != null) {
            return ResponseEntity.ok(numFamille);
        } else {
            return ResponseEntity.ok(null);
        }
    }
}

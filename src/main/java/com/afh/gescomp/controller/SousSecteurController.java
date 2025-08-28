package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.SousSecteur;
import com.afh.gescomp.service.SousSecteurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/sous-secteurs")
public class SousSecteurController {

    @Autowired
    private SousSecteurService sousSecteurService;

    @RequestMapping(value = "/secteur/{numSectEco}", method = RequestMethod.GET)
    public List<SousSecteur> getSousSecteursBySecteur(@PathVariable Short numSectEco) {
        return sousSecteurService.getSousSecteursBySecteur(numSectEco);
    }

    @RequestMapping(value = "/designation", method = RequestMethod.GET)
    public ResponseEntity<Short> getNumSSecteurByDesignation(@RequestParam  String designation) {
        Short numSSectEco= sousSecteurService.getNumSSecteurByDesignation(designation);
        if (numSSectEco != null) {
            return ResponseEntity.ok(numSSectEco);
        } else {
            return ResponseEntity.ok(null);
        }
    }
}

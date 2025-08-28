package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Secteur;
import com.afh.gescomp.service.SecteurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/secteurs")
public class SecteurController {

    @Autowired
    private SecteurService secteurService;

    @RequestMapping(method = RequestMethod.GET)
    public List<Secteur> getAllSecteurs() {
        return secteurService.getAllSecteur();
    }

    @RequestMapping(value = "/designation", method = RequestMethod.GET)
    public ResponseEntity<Short> getNumSecteurByDesignation(@RequestParam  String designation) {
        Short numSectEco= secteurService.getNumSecteurByDesignation(designation);
        if (numSectEco != null) {
            return ResponseEntity.ok(numSectEco);
        } else {
            return ResponseEntity.ok(null);
        }
    }

}

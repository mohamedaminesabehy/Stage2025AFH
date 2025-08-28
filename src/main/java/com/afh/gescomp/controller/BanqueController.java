package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Banque;
import com.afh.gescomp.service.BanqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/banques")
public class BanqueController {

    @Autowired
    public BanqueService banqueService;


    @RequestMapping(method = RequestMethod.GET)
    public List<Banque> getBanques() {
        return banqueService.getAllBanque();
    }

    @RequestMapping(value = "/{numBanque}", method = RequestMethod.GET)
    public ResponseEntity<Banque> getBanqueByNumBanque(@PathVariable Short numBanque) {
        Banque banque = banqueService.getBanqueByNumBanque(numBanque);
        if (banque == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(banque, HttpStatus.OK);
    }

}

package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.OrdreService;
import com.afh.gescomp.model.primary.PrmTypeOrdreService;
import com.afh.gescomp.repository.primary.PrmTypeOrdreServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/PrmTypeOrdreService")
public class PrmTypeOrdreServiceController {

    @Autowired
    private PrmTypeOrdreServiceRepository prmTypeOrdreServiceRepository;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<PrmTypeOrdreService>> getPrmTypeOrdresService() {
        List<PrmTypeOrdreService> prmTypeOrdreServices= prmTypeOrdreServiceRepository.findAll();
        return ResponseEntity.ok(prmTypeOrdreServices);
    }
}

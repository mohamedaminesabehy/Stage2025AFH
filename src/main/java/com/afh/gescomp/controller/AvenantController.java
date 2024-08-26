package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Avenant;
import com.afh.gescomp.repository.primary.AvenantRepository;
import com.afh.gescomp.service.AvenantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api")
public class AvenantController {

    private final AvenantService avenantService ;

    @Autowired
    public  AvenantRepository avenantRepository;

    @Autowired
    public AvenantController(AvenantService avenantService) {
        this.avenantService = avenantService;
    }


    @GetMapping("/avenants")
    public ResponseEntity<List<Avenant>> getAvenants(){
        return  ResponseEntity.ok(this.avenantRepository.findAll());

    }
}

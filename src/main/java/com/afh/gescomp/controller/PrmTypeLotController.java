package com.afh.gescomp.controller;


import com.afh.gescomp.model.primary.PrmTypeLot;
import com.afh.gescomp.service.PrmTypeLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/PrmTypeLot")
public class PrmTypeLotController {

    @Autowired
    public PrmTypeLotService prmTypeLotService;



    @RequestMapping(method = RequestMethod.GET)
    public List<PrmTypeLot> PrmTypeLots() {
        return prmTypeLotService.getPrmTypeLots();
    }

    @RequestMapping(value = "/{id}/designation", method = RequestMethod.GET)
    public ResponseEntity<Map<String, String>> getTypeLotDesignation(@PathVariable Long id) {
        String designation = prmTypeLotService.getTypeLotDesignationById(id); // Supposons que c'est votre méthode
        Map<String, String> response = new HashMap<>();
        response.put("designation", designation);
        return ResponseEntity.ok(response);
    }
}

package com.afh.gescomp.controller;


import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.DecLot;
import com.afh.gescomp.model.primary.DecMnt;
import com.afh.gescomp.service.DecLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/decLot")
public class DecLotController {


    @Autowired
    private DecLotService decLotService;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<DecLot>> getDecLot(@RequestParam("numMarche") Long numMarche,
                                                 @RequestParam("numPieceFourn") Long numPieceFourn,
                                                 @RequestParam("idLot") String idLot) {
        List<DecLot> decLots = decLotService.findDecLotByNumMarcheAndNumPieceFournAndIdLot(numMarche, numPieceFourn, idLot);
        return ResponseEntity.ok(decLots);
    }
}

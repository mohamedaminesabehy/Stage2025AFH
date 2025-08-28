package com.afh.gescomp.controller;

import com.afh.gescomp.dto.MrcPenaliteDTO;
import com.afh.gescomp.exception.ErrorResponse;
import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.model.primary.MrcPenalite;
import com.afh.gescomp.model.primary.MrcPenaliteId;
import com.afh.gescomp.service.MrcPenaliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.LinkedHashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/MrcPenalite")
public class MrcPenaliteController {

    @Autowired
    private MrcPenaliteService mrcPenaliteService;

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<?> saveOrUpdateMrcPenalite(@Valid @RequestBody MrcPenaliteDTO mrcPenaliteDTO) {
        try {
            MrcPenalite savedMrcPenalite = mrcPenaliteService.saveOrUpdateMrcPenalite(mrcPenaliteDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMrcPenalite);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Internal server error"));
        }
    }

    @RequestMapping(method = RequestMethod.GET)
    public MrcPenalite GetMrcPenalite(@RequestParam("numMarche") Long numMarche,
                                                      @RequestParam("numPen") Long numPen,
                                      @RequestParam("numPieceFourn") Short numPieceFourn)
    {
        return mrcPenaliteService.getMrcPenalite(numMarche, numPen, numPieceFourn);
    }

    @RequestMapping(value = "/numPen/{numMarche}", method = RequestMethod.GET)
    public ResponseEntity<Integer> getNumPen(@PathVariable("numMarche") int numMarche) {
        int numPen = mrcPenaliteService.getMaxNumPenForMarche(numMarche);
        return ResponseEntity.ok(numPen);
    }


}

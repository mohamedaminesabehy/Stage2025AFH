package com.afh.gescomp.controller;

import com.afh.gescomp.dto.DecPenaliteDTO;
import com.afh.gescomp.dto.MrcPenaliteDTO;
import com.afh.gescomp.exception.ErrorResponse;
import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.DecPenalite;
import com.afh.gescomp.model.primary.MrcPenalite;
import com.afh.gescomp.service.DecPenaliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/DecPenalite")
public class DecPenaliteController {

    @Autowired
    private DecPenaliteService decPenaliteService;

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<?> saveOrUpdateDecPenalite(@Valid @RequestBody DecPenaliteDTO decPenaliteDTO) {
        try {
            DecPenalite savedDecPenalite = decPenaliteService.saveOrUpdateDecPenalite(decPenaliteDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedDecPenalite);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Internal server error"));
        }
    }

        @RequestMapping(method = RequestMethod.GET)
        public DecPenalite GetDecPenalite(@RequestParam("numMarche") Long numMarche,
                                          @RequestParam("idTypePen") Long idTypePen,
                                          @RequestParam("numPieceFourn") Long numPieceFourn)
        {
            return decPenaliteService.getDecPenalite(numMarche, idTypePen, numPieceFourn);
        }
}

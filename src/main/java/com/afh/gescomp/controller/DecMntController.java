package com.afh.gescomp.controller;


import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.DecMnt;
import com.afh.gescomp.payload.request.DecMntUpdateRequest;
import com.afh.gescomp.repository.primary.PrmTypeDecRepository;
import com.afh.gescomp.service.DecMntService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;


@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/decMnt")
public class DecMntController {

    @Autowired
    private DecMntService decMntService;


    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<DecMnt> getDecMnt(@RequestParam("numMarche") Long numMarche,
                                            @RequestParam("numPieceFourn") Short numPieceFourn) {
        DecMnt decMnt = decMntService.findById(numMarche, numPieceFourn);

        // Vérification si le décompte existe
        if (decMnt == null) {
            // Lancer une exception personnalisée si le décompte n'existe pas
            throw new ResourceNotFoundException("Le décompte avec numMarche=" + numMarche + " et numPieceFourn=" + numPieceFourn + " n'a pas été trouvé.");
        }

        return ResponseEntity.ok(decMnt);
    }


    @RequestMapping(value = "/updateDecMntOrd", method = RequestMethod.PATCH)
    public ResponseEntity<DecMnt> patchDecMntOrd(
            @RequestParam Long numMarche,
            @RequestParam Short numPieceFourn,
            @RequestBody DecMntUpdateRequest DecMntToUpdate) {
        DecMnt updatedDecMnt = decMntService.patchDecMntOrd(numMarche, numPieceFourn, DecMntToUpdate);
        return ResponseEntity.ok(updatedDecMnt);
    }

    @RequestMapping(value = "/getPreviousDecTravauxNetAvantRtn",method = RequestMethod.GET)
    public ResponseEntity<BigDecimal> getPreviousDecTravauxNetAvantRtn(
            @RequestParam Long numMarche,
            @RequestParam Short numPieceFourn) {
        try {
            BigDecimal previousDecTravauxNetAvantRtn = decMntService.getPreviousDecTravauxNetAvantRtn(numMarche, numPieceFourn);
            return ResponseEntity.ok(previousDecTravauxNetAvantRtn);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(BigDecimal.ZERO);
        }
    }
}

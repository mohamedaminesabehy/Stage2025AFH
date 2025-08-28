package com.afh.gescomp.controller;

import com.afh.gescomp.dto.PrmLotDTO;
import com.afh.gescomp.dto.PrmTypeLotDTO;
import com.afh.gescomp.model.primary.DecArticle;
import com.afh.gescomp.model.primary.MrcLot;
import com.afh.gescomp.model.primary.PrmLot;
import com.afh.gescomp.model.primary.PrmTypeLot;
import com.afh.gescomp.service.PrmLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/PrmLot")
public class PrmLotController {

    @Autowired
    private PrmLotService prmLotService;


    /*@RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<PrmLotDTO>> getPrmLots() {
        List<PrmLotDTO> prmLotsDtos = prmLotService.getPrmLots();
        for (PrmLotDTO prmLotDTO : prmLotsDtos) {
            if (prmLotDTO.getIdTypeLot() != null) {
                PrmTypeLot typeLotDTO = new PrmTypeLot(
                        prmLotDTO.getIdTypeLot().getId(),
                        prmLotDTO.getIdTypeLot().getDesignation()
                );
                prmLotDTO.setIdTypeLot(typeLotDTO);
            }
        }
        return ResponseEntity.ok(prmLotsDtos);
    }*/

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<PrmLotDTO>> getPrmLotsByMatricule(@RequestParam("matricule") Integer matricule) {
        List<PrmLotDTO> prmLotsDtos = prmLotService.getPrmLotsByMatricule(matricule);

        for (PrmLotDTO prmLotDTO : prmLotsDtos) {
            if (prmLotDTO.getIdTypeLot() != null) {
                PrmTypeLot typeLotDTO = new PrmTypeLot(
                        prmLotDTO.getIdTypeLot().getId(),
                        prmLotDTO.getIdTypeLot().getDesignation()
                );
                prmLotDTO.setIdTypeLot(typeLotDTO);
            }
        }

        return ResponseEntity.ok(prmLotsDtos);
    }



}

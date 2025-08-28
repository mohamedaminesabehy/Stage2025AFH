package com.afh.gescomp.controller;


import com.afh.gescomp.dto.MrcLotDto;
import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.repository.primary.PrmLotRepository;
import com.afh.gescomp.repository.primary.PrmTypeLotRepository;
import com.afh.gescomp.service.MrcLotService;
import com.afh.gescomp.service.PrmLotService;
import com.afh.gescomp.service.PrmTypeLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/MrcLot")
public class MrcLotController {

    @Autowired
    private MrcLotService mrcLotService;

    @Autowired
    private PrmTypeLotService prmTypeLotService;

    @Autowired
    private PrmLotService prmLotService;

    @RequestMapping(value = "/{numMarche}", method = RequestMethod.GET)
    public ResponseEntity<List<Map<String, Object>>> getMrcLotsbyNumMarche(@PathVariable Long numMarche) {
        List<MrcLot> mrcLots = mrcLotService.getMrcLotsByNumMarche(numMarche);
        List<Map<String, Object>> response = new ArrayList<>();

        for (MrcLot mrcLot : mrcLots) {
            Map<String, Object> lotMap = new HashMap<>();
            lotMap.put("id", mrcLot.getId());
            lotMap.put("numMarche", mrcLot.getNumMarche().getId());
            lotMap.put("idTypeLot", mrcLot.getTypeLot(prmTypeLotService)); // Appel au service
            lotMap.put("designation", mrcLot.getDesignation());

            PrmLot prmLot = prmLotService.findPrmLotByIdLot(mrcLot.getId().getIdLot());
            lotMap.put("idPrmLot", prmLot);

            response.add(lotMap);
        }
        return ResponseEntity.ok(response);
    }
    @RequestMapping(value = "/{numMarche}/{idLot}", method = RequestMethod.GET)
    public ResponseEntity<?> getMrcLotsbyNumMarcheAndIdLot(@PathVariable Long numMarche, @PathVariable String idLot) {
        MrcLot mrcLot = mrcLotService.getMrcLotsByNumMarcheAndIdLot(numMarche, idLot);
        if(mrcLot==null){
            throw new RuntimeException("MrcLot not found");
        }
        return ResponseEntity.ok(mrcLot);
    }



    @RequestMapping(value = "/{numMarche}", method = RequestMethod.POST)
    public ResponseEntity<List<MrcLot>> saveMrcLots(@PathVariable Long numMarche,@RequestBody List<MrcLotDto> mrcLotDtos) {
        for (MrcLotDto dto : mrcLotDtos) {
            dto.setNumMarche(numMarche);
        }
        List<MrcLot> createdMrcLots = mrcLotService.saveMrcLots(numMarche, mrcLotDtos);
        return ResponseEntity.ok(createdMrcLots);
    }



    @RequestMapping(value = "/{numMarche}/{idLot}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteMrcLot(@PathVariable Long numMarche,@PathVariable String idLot) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        MrcLotId mrcLotId = new MrcLotId(numMarche, idLot);
        mrcLotService.deleteMrcLot(mrcLotId);
        map.put("status", 1);
        map.put("message", "Record is deleted successfully!");
        return new ResponseEntity<>(map,HttpStatus.OK);
    }

}

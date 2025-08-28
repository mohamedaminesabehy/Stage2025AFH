package com.afh.gescomp.controller;

import com.afh.gescomp.dto.MrcGarantieDTO;
import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.service.MarcheService;
import com.afh.gescomp.service.MrcGarantieService;
import com.afh.gescomp.service.TypeGarantieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/MrcGarantie")
public class MrcGarantieController {
    @Autowired
    private MrcGarantieService mrcGarantieService;

    @RequestMapping(value = "/garantie/{numMarche}", method = RequestMethod.GET)
    public ResponseEntity<List<MrcGarantie>> getEtapesForMarche(@PathVariable Long numMarche) {
        List<MrcGarantie> mrcGaranties = mrcGarantieService.findByNumMarche(numMarche);
        return ResponseEntity.ok(mrcGaranties);
    }

    @RequestMapping(value = "/addGaranties", method = RequestMethod.POST)
    public ResponseEntity<List<MrcGarantie>> addMultipleMrcGaranties(@RequestBody List<MrcGarantieDTO> mrcGarantiesDTO) {
        List<MrcGarantie> mrcGaranties = mrcGarantieService.convertDtoToEntity(mrcGarantiesDTO);
        List<MrcGarantie> savedGaranties = mrcGarantieService.saveMrcGaranties(mrcGaranties);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedGaranties);
    }

    @RequestMapping(value = "/garantie/{numMarche}/{numGarantie}/{idTypeGarantie}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteEtape(@PathVariable long numMarche, @PathVariable long numGarantie, @PathVariable Long idTypeGarantie) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        MrcGarantieId id = new MrcGarantieId(numMarche, numGarantie, idTypeGarantie);
        mrcGarantieService.delete(id);
        map.put("status", 1);
        map.put("message", "Record is deleted successfully!");
        return new ResponseEntity<>(map,HttpStatus.OK);
    }


}

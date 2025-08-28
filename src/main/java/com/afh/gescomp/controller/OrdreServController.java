package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.MrcArticle;
import com.afh.gescomp.model.primary.OrdreService;
import com.afh.gescomp.service.OrdreServService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/OrdreService")
public class OrdreServController {

    @Autowired
    private OrdreServService ordreService;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<OrdreService>> getOrdreService(
            @RequestParam("numMarche") Long numMarche,
            @RequestParam("numEtape") Short numEtape) {
         List<OrdreService> ordService= ordreService.getOrdreServiceByNumMarcheAndNumEtape(numMarche, numEtape);
         return ResponseEntity.ok(ordService);
    }

    @Transactional
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<List<OrdreService>> saveOrUpdateOrdreService(@RequestBody List<OrdreService> ordreServices) {
        List<OrdreService> ordreServiceList;
        ordreServiceList = ordreService.saveOrUpdateOrdreService(ordreServices);
        return ResponseEntity.ok(ordreServiceList);
    }

    @RequestMapping(value = "/{numMarche}/{numEtape}/{numOs}", method = RequestMethod.DELETE)
    public ResponseEntity<Map<String, Object>> deleteOrdreService(
            @PathVariable Long numMarche,
            @PathVariable Short numEtape,
            @PathVariable Integer numOs) {

        Map<String, Object> map = new HashMap<>();
        try {
            ordreService.deleteOrdreService(numMarche, numEtape, numOs);
            map.put("status", 1);
            map.put("message", "Record is deleted successfully!");
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (EntityNotFoundException ex) {
            map.put("status", 0);
            map.put("message", "OrdreService not found: " + ex.getMessage());
            return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
        }catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

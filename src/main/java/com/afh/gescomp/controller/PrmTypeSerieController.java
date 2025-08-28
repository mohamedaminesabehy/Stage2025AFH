package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.MrcArticle;
import com.afh.gescomp.model.primary.PrmTypeSerie;
import com.afh.gescomp.service.PrmTypeSerieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/PrmTypeSeries")
public class PrmTypeSerieController {

    @Autowired
    private PrmTypeSerieService prmTypeSerieService;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<PrmTypeSerie>> getPrmTypeSeries() {
        List<PrmTypeSerie> prmTypeSeries = prmTypeSerieService.getPrmTypeSeries();
        return ResponseEntity.ok(prmTypeSeries);
    }
}

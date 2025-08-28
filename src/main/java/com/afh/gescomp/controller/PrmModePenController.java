package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.PrmModePen;
import com.afh.gescomp.model.primary.PrmStructure;
import com.afh.gescomp.service.PrmModePenService;
import com.afh.gescomp.service.PrmStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/PrmModePen")
public class PrmModePenController {

    @Autowired
    private PrmModePenService prmModePenService;

    @RequestMapping(method = RequestMethod.GET)
    public List<PrmModePen> getPrmModePens() {
        return prmModePenService.getAllPrmModePen();
    }
}

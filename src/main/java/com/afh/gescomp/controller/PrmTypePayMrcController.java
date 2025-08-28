package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Banque;
import com.afh.gescomp.model.primary.PrmTypePayMrc;
import com.afh.gescomp.service.PrmTypePayMrcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/PrmTypePayMrc")
public class PrmTypePayMrcController {

    @Autowired
    private PrmTypePayMrcService prmTypePayMrcService;

    @RequestMapping(method = RequestMethod.GET)
    public List<PrmTypePayMrc> getPrmTypePayMrcs() {
        return prmTypePayMrcService.getAllPrmTypePayMrc();
    }
}

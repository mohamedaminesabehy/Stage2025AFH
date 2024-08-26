package com.afh.gescomp.service;

import com.afh.gescomp.repository.primary.AvenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AvenantService {

    private final AvenantRepository avenantRepository;

    @Autowired
    public AvenantService(AvenantRepository avenantRepository){
        this.avenantRepository = avenantRepository;
    }

}

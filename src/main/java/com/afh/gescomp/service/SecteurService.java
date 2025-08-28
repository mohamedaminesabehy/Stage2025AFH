package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.Secteur;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SecteurService {
    List<Secteur> getAllSecteur();
    Short getNumSecteurByDesignation(String designation);
}

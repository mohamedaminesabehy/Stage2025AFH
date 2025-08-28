package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.TypeGarantie;
import com.afh.gescomp.model.primary.TypePenalite;

import java.util.List;


public interface TypePenaliteService {
     void save(TypePenalite typePenalite);
     TypePenalite findById(Long id);
     void deleteTypePenalite(TypePenalite typePenalite);
     List<TypePenalite> findAllByOrderByIdAsc();

}

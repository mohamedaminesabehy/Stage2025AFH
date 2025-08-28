package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.TypeGarantie;

import java.util.List;

public interface TypeGarantieService {

     void save(TypeGarantie typeGarantie);
     TypeGarantie findById(Long id);
     void deleteTypeGarantie(TypeGarantie typeGarantie);
     List<TypeGarantie> findAllByOrderByIdAsc();

}

package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.OrdreService;
import com.afh.gescomp.model.primary.OrdreServiceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdreServiceRepository extends JpaRepository<OrdreService, OrdreServiceId> {
    List<OrdreService> findById_NumMarcheAndId_NumEtape(Long numMarche, Short numEtape);
    OrdreService findById_NumMarcheAndId_NumEtapeAndId_NumOs(Long numMarche, Short numEtape, Integer numOs);
}
package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.MrcEtape;
import com.afh.gescomp.model.primary.MrcGarantie;
import com.afh.gescomp.model.primary.MrcGarantieId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MrcGarantieRepository extends JpaRepository<MrcGarantie, MrcGarantieId> {
    List<MrcGarantie> findById_NumMarche(Long numMarche);
}
package com.afh.gescomp.service;

import com.afh.gescomp.dto.MrcGarantieDTO;
import com.afh.gescomp.model.primary.MrcGarantie;
import com.afh.gescomp.model.primary.MrcGarantieId;

import java.util.List;

public interface MrcGarantieService {
    List<MrcGarantie> findByNumMarche(Long numMarche);
    List<MrcGarantie> saveMrcGaranties(List<MrcGarantie> mrcGaranties);
    List<MrcGarantie> convertDtoToEntity(List<MrcGarantieDTO> mrcGarantiesDTO);
    void delete(MrcGarantieId id);
}

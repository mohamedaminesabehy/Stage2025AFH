package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.OrdreService;
import java.util.List;

public interface OrdreServService {
    List<OrdreService> getOrdreServiceByNumMarcheAndNumEtape(Long numMarche, Short numEtape);
    List<OrdreService> saveOrUpdateOrdreService(List<OrdreService> ordreServices);
    OrdreService findByNumMarcheAndNumEtapeAndNumOs(Long numMarche, Short numEtape, Integer numOs);
    void deleteOrdreService(Long numMarche, Short numEtape, Integer numOs);
}

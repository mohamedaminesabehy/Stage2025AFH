package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.repository.primary.OrdreServiceRepository;
import com.afh.gescomp.service.OrdreServService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
public class OdreServServiceImpl implements OrdreServService {

    @Autowired
    private OrdreServiceRepository ordreServiceRepository;

    @Override
    public List<OrdreService> getOrdreServiceByNumMarcheAndNumEtape(Long numMarche, Short numEtape) {
        return ordreServiceRepository.findById_NumMarcheAndId_NumEtape(numMarche, numEtape);
    }

    @Transactional
    @Override
    public List<OrdreService> saveOrUpdateOrdreService(List<OrdreService> ordreServices) {
        List<OrdreService> savedOrderServices = new ArrayList<>();
        for (OrdreService ordreServiceRequest : ordreServices) {
            if (ordreServiceRequest.getId() == null) {
                throw new IllegalArgumentException("OrderService ID cannot be null");
            }

            OrdreServiceId ordreServiceId = ordreServiceRequest.getId();
            OrdreService existingOrdreService = ordreServiceRepository.findById_NumMarcheAndId_NumEtapeAndId_NumOs(
                    ordreServiceId.getNumMarche(),
                    ordreServiceId.getNumEtape(),
                    ordreServiceId.getNumOs()
            );

            if (existingOrdreService != null) {
                updateOrdreService(existingOrdreService, ordreServiceRequest);
                ordreServiceRepository.save(existingOrdreService); // Persist changes
                savedOrderServices.add(existingOrdreService);
            } else {
                OrdreService newOrdreService = createOrdreService(ordreServiceRequest);
                ordreServiceRepository.save(newOrdreService);
                savedOrderServices.add(newOrdreService);
            }
        }
        return savedOrderServices;
    }

    private void updateOrdreService(OrdreService existingOrdreService, OrdreService ordreServiceRequest) {
        // Mise à jour du type d'ordre de service
        PrmTypeOrdreService typeOrdreService = ordreServiceRequest.getIdTypeOrdreService();
        if (typeOrdreService != null) {
            existingOrdreService.setIdTypeOrdreService(typeOrdreService);
        }

        // Mise à jour de la date de début
        Date dateDebut = ordreServiceRequest.getDateDebut();
        if (dateDebut != null) {
            existingOrdreService.setDateDebut(dateDebut);
        }

        Date dateFin = ordreServiceRequest.getDateFin();
        if (dateFin != null) {
            existingOrdreService.setDateFin(dateFin);
        }

        Date dateEditOs = ordreServiceRequest.getDateEditOs();
        if (dateEditOs != null) {
            existingOrdreService.setDateEditOs(dateEditOs);
        }

        Date dateNotifOs = ordreServiceRequest.getDateNotifOs();
        if (dateNotifOs != null) {
            existingOrdreService.setDateNotifOs(dateNotifOs);
        }

        String codeOrd = ordreServiceRequest.getCodeOrd();
        if (codeOrd != null) {
            existingOrdreService.setCodeOrd(codeOrd);
        }

        String designation = ordreServiceRequest.getDesignation();
        if (designation != null) {
            existingOrdreService.setDesignation(designation);
        }

        Long dureeOs = ordreServiceRequest.getDureeOs();
        if (dureeOs != null) {
            existingOrdreService.setDureeOs(dureeOs);
        }
    }



    private OrdreService createOrdreService(OrdreService ordreServiceRequest) {
        // Création d'un nouveau OrdreService
        OrdreService newOrdreService = new OrdreService();

        // On récupère l'ID à partir de la requête
        OrdreServiceId ordreServiceId = ordreServiceRequest.getId();
        newOrdreService.setId(ordreServiceId);

        PrmTypeOrdreService typeOrdreService = ordreServiceRequest.getIdTypeOrdreService();
        newOrdreService.setIdTypeOrdreService(typeOrdreService);

        Date dateDebut = ordreServiceRequest.getDateDebut();
        newOrdreService.setDateDebut(dateDebut);

        Date dateFin = ordreServiceRequest.getDateFin();
        newOrdreService.setDateFin(dateFin);

        Date dateEditOs = ordreServiceRequest.getDateEditOs();
        newOrdreService.setDateEditOs(dateEditOs);

        Date dateNotifOs = ordreServiceRequest.getDateNotifOs();
        newOrdreService.setDateNotifOs(dateNotifOs);

        String codeOrd = ordreServiceRequest.getCodeOrd();
        newOrdreService.setCodeOrd(codeOrd);

        String designation = ordreServiceRequest.getDesignation();
        newOrdreService.setDesignation(designation);

        Long dureeOs = ordreServiceRequest.getDureeOs();
        newOrdreService.setDureeOs(dureeOs);

        return newOrdreService;
    }

    @Override
    public OrdreService findByNumMarcheAndNumEtapeAndNumOs(Long numMarche, Short numEtape, Integer numOs) {
        return ordreServiceRepository.findById_NumMarcheAndId_NumEtapeAndId_NumOs(numMarche, numEtape, numOs);
    }

    @Override
    public void deleteOrdreService(Long numMarche, Short numEtape, Integer numOs) {
        OrdreServiceId ordreServiceId = new OrdreServiceId(numMarche, numEtape, numOs);
        if (!ordreServiceRepository.exists(ordreServiceId)) {
            throw new EntityNotFoundException("OrdreService not found with id: " + ordreServiceId);
        }
        ordreServiceRepository.delete(ordreServiceId);
    }
}

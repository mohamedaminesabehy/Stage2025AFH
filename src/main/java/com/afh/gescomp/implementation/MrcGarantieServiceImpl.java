package com.afh.gescomp.implementation;

import com.afh.gescomp.dto.MrcGarantieDTO;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.model.primary.MrcGarantie;
import com.afh.gescomp.model.primary.MrcGarantieId;
import com.afh.gescomp.model.primary.TypeGarantie;
import com.afh.gescomp.repository.primary.MrcGarantieRepository;
import com.afh.gescomp.service.MarcheService;
import com.afh.gescomp.service.MrcGarantieService;
import com.afh.gescomp.service.TypeGarantieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class MrcGarantieServiceImpl implements MrcGarantieService {


    @Autowired
    private MarcheService marcheService;

    @Autowired
    private TypeGarantieService typeGarantieService;

    @Autowired
    private MrcGarantieRepository mrcGarantieRepository;

    @Override
    public List<MrcGarantie> findByNumMarche(Long numMarche) {
        return mrcGarantieRepository.findById_NumMarche(numMarche);
    }

    @Transactional
    @Override
    public List<MrcGarantie> saveMrcGaranties(List<MrcGarantie> mrcGaranties) {
        List<MrcGarantie> savedGaranties = new ArrayList<>();
        for (MrcGarantie mrcGarantie : mrcGaranties) {
            savedGaranties.add(mrcGarantieRepository.save(mrcGarantie)); // Sauvegarde chaque entité
        }
        return savedGaranties;
    }

    @Override
    public List<MrcGarantie> convertDtoToEntity(List<MrcGarantieDTO> mrcGarantiesDTO) {
        List<MrcGarantie> mrcGaranties = new ArrayList<>();
        for (MrcGarantieDTO garantieDTO : mrcGarantiesDTO) {
            MrcGarantie mrcGarantie = new MrcGarantie();
            MrcGarantieId mrcGarantieId = new MrcGarantieId();
            mrcGarantieId.setNumMarche(garantieDTO.getNumMarche());
            mrcGarantieId.setNumGarantie(garantieDTO.getNumGarantie());
            mrcGarantieId.setIdTypeGarantie(garantieDTO.getIdTypeGarantie());
            mrcGarantie.setId(mrcGarantieId);

            // Récupérer les entités associées
            Marche numMarche = marcheService.findMarcheByNumMarche(garantieDTO.getNumMarche());
            TypeGarantie idTypeGarantie = typeGarantieService.findById(garantieDTO.getIdTypeGarantie());

            mrcGarantie.setNumMarche(numMarche);
            mrcGarantie.setIdTypeGarantie(idTypeGarantie);
            mrcGarantie.setDateDebut(garantieDTO.getDateDebut());
            mrcGarantie.setMntGar(garantieDTO.getMntGar());

            mrcGaranties.add(mrcGarantie);
        }
        return mrcGaranties;
    }

    @Override
    public void delete(MrcGarantieId id) {
        mrcGarantieRepository.delete(id);
    }
}

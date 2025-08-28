package com.afh.gescomp.implementation;

import com.afh.gescomp.dto.DecPenaliteDTO;
import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.repository.primary.*;
import com.afh.gescomp.service.DecPenaliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DecPenaliteServiceImpl implements DecPenaliteService {

    @Autowired
    private MarcheRepository marcheRepository;

    @Autowired
    private DecPenaliteRepository decPenaliteRepository;

    @Autowired
    private MrcEtapeRepository etapeRepository;

    @Autowired
    private DecompteRepository  decompteRepository;

    @Autowired
    private TypePenaliteRepository  typePenaliteRepository;

    @Override
    public DecPenalite saveOrUpdateDecPenalite(DecPenaliteDTO decPenaliteDTO) {
        Marche marche = marcheRepository.findById(decPenaliteDTO.getNumMarche());
        if (marche == null) {
            throw new ResourceNotFoundException("Marche not found with id " + decPenaliteDTO.getNumMarche());
        }

        MrcEtape mrcEtape = etapeRepository.findByNumMarcheAndNumEtape(decPenaliteDTO.getNumMarche(), decPenaliteDTO.getNumEtape());
        if (mrcEtape == null) {
            throw new ResourceNotFoundException("MrcEtape not found for numMarche " + decPenaliteDTO.getNumMarche()
                    + " and numEtape " + decPenaliteDTO.getNumEtape());
        }

        DecPenalite existingDecPenaliteUnique = decPenaliteRepository.findByIdTypePen_IdAndId_NumPieceFournAndIdNumMarche(
                decPenaliteDTO.getIdTypePen().getId(),
                decPenaliteDTO.getNumPieceFourn(),
                decPenaliteDTO.getNumMarche()
        );

        if (existingDecPenaliteUnique != null) {
            existingDecPenaliteUnique.setMontantPenAutre(decPenaliteDTO.getMontantPenAutre());
            existingDecPenaliteUnique.setDatePen(decPenaliteDTO.getDatePen());
            existingDecPenaliteUnique.setDesignation(decPenaliteDTO.getDesignation());

            return decPenaliteRepository.save(existingDecPenaliteUnique);
        }

        Long lastNumPen = decPenaliteRepository.findMaxNumPenForMarcheAndPieceFourn(
                decPenaliteDTO.getNumMarche(),
                decPenaliteDTO.getNumPieceFourn()
        );

        Long newNumPen = (lastNumPen != null) ? lastNumPen + 1 : 1L; // Si pas de pénalité, commencer par 1
        DecPenaliteId decPenaliteId = new DecPenaliteId();
        decPenaliteId.setNumMarche(decPenaliteDTO.getNumMarche());
        decPenaliteId.setNumPieceFourn(decPenaliteDTO.getNumPieceFourn());
        decPenaliteId.setNumPen(newNumPen);

        DecPenalite decPenalite = new DecPenalite();
        decPenalite.setId(decPenaliteId);
        decPenalite.setIdTypePen(decPenaliteDTO.getIdTypePen());
        decPenalite.setMontantPenAutre(decPenaliteDTO.getMontantPenAutre());
        decPenalite.setDatePen(decPenaliteDTO.getDatePen());
        decPenalite.setDesignation(decPenaliteDTO.getDesignation());
        decPenalite.setNumEtape(decPenaliteDTO.getNumEtape());
        return decPenaliteRepository.save(decPenalite);
    }

    @Override
    public DecPenalite getDecPenalite(Long numMarche, Long idTypePen, Long numPieceFourn) {
        return decPenaliteRepository.findByIdTypePen_IdAndId_NumPieceFournAndIdNumMarche(idTypePen,numPieceFourn,numMarche);
    }


}

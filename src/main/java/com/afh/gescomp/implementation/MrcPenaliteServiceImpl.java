package com.afh.gescomp.implementation;

import com.afh.gescomp.dto.MrcPenaliteDTO;
import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.repository.primary.MarcheRepository;
import com.afh.gescomp.repository.primary.MrcEtapeRepository;
import com.afh.gescomp.repository.primary.MrcPenaliteRepository;
import com.afh.gescomp.service.MrcPenaliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class MrcPenaliteServiceImpl implements MrcPenaliteService {

    @Autowired
    private MrcPenaliteRepository mrcPenaliteRepository;

    @Autowired
    private MrcEtapeRepository etapeRepository;

    @Autowired
    private MarcheRepository  marcheRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public MrcPenalite saveOrUpdateMrcPenalite(MrcPenaliteDTO mrcPenaliteDTO) {

        Marche marche = marcheRepository.findById(mrcPenaliteDTO.getNumMarche());
        if( marche == null) {
           throw new ResourceNotFoundException("Marche not found with id " + mrcPenaliteDTO.getNumMarche());
        }

        MrcEtape mrcEtape = etapeRepository.findByNumMarcheAndNumEtape(mrcPenaliteDTO.getNumMarche(), mrcPenaliteDTO.getNumEtape());
        if (mrcEtape == null) {
            throw new ResourceNotFoundException("MrcEtape not found for numMarche " + mrcPenaliteDTO.getNumMarche()
                    + " and numEtape " + mrcPenaliteDTO.getNumEtape());
        }

        MrcPenalite existingMrcPenalite = mrcPenaliteRepository.findOne(new MrcPenaliteId(mrcPenaliteDTO.getNumMarche(), mrcPenaliteDTO.getNumPen()));
        MrcPenalite mrcPenalite;
        if (existingMrcPenalite != null) {
            // Si la pénalité existe déjà, on la met à jour
            mrcPenalite = existingMrcPenalite;
            mrcPenalite.setDatePen(mrcPenaliteDTO.getDatePen());
            mrcPenalite.setMontantPen(mrcPenaliteDTO.getMontantPen());
            mrcPenalite.setIdTypePen(mrcPenaliteDTO.getIdTypePen());
            mrcPenalite.setNumPieceFourn(mrcPenaliteDTO.getNumPieceFourn());
        } else {
            // Si la pénalité n'existe pas, on la crée
            mrcPenalite = new MrcPenalite();
            mrcPenalite.setId(new MrcPenaliteId(mrcPenaliteDTO.getNumMarche(), mrcPenaliteDTO.getNumPen()));
            mrcPenalite.setNumEtape(mrcEtape.getId().getNumEtape());
            mrcPenalite.setDatePen(mrcPenaliteDTO.getDatePen());
            mrcPenalite.setMontantPen(mrcPenaliteDTO.getMontantPen());
            mrcPenalite.setIdTypePen(mrcPenaliteDTO.getIdTypePen());
            mrcPenalite.setNumPieceFourn(mrcPenaliteDTO.getNumPieceFourn());
        }

        return mrcPenaliteRepository.save(mrcPenalite);
    }

    @Override
    public MrcPenalite getMrcPenalite(Long numMarche, Long numPen, Short numPieceFourn) {
        return mrcPenaliteRepository.findMrcPenaliteById_NumMarcheAndId_NumPenAndNumPieceFourn(numMarche, numPen, numPieceFourn);
    }

    @Override
    public int getMaxNumPenForMarche(int numMarche) {
        String query = "SELECT MAX(NUM_PEN) FROM MRC_PENALITE WHERE NUM_MARCHE = ?";
        Integer numPen  = jdbcTemplate.queryForObject(query, Integer.class, numMarche);
        if (numPen  == null || numPen  == 0) {
            return 0;
        }
        return numPen;
    }
}

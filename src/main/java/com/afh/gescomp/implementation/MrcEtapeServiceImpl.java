package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.model.primary.MrcEtape;
import com.afh.gescomp.model.primary.MrcEtapeId;
import com.afh.gescomp.repository.primary.MarcheRepository;
import com.afh.gescomp.repository.primary.MrcEtapeRepository;
import com.afh.gescomp.service.MrcEtapeService;
import javax.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MrcEtapeServiceImpl implements MrcEtapeService {

    @Autowired
    private MrcEtapeRepository mrcEtapeRepository;

    @Autowired
    private MarcheRepository marcheRepository;

    @Override
    public MrcEtape save(MrcEtape mrcEtapeRequest) {
        Marche marche = marcheRepository.findById(mrcEtapeRequest.getId().getNumMarche());
        mrcEtapeRequest.setNumMarche(marche);
      return   mrcEtapeRepository.save(mrcEtapeRequest);
    }

    @Override
    public List<MrcEtape> getEtapesForMarche(Long numMarche) {
        return mrcEtapeRepository.findById_NumMarche(numMarche);
    }

    @Override
    public void delete(MrcEtapeId id) {
        mrcEtapeRepository.delete(id);
    }

    @Override
    public MrcEtape findById(Long numMarche, Short numEtape) {
        return mrcEtapeRepository.findOne(new MrcEtapeId(numMarche, numEtape));
    }

    @Override
    public Short getNextNumEtape(Long numMarche) {
        Short maxNumEtape = mrcEtapeRepository.findMaxNumEtapeByMarche(numMarche);
        return (maxNumEtape != null ? (short) (maxNumEtape + 1) : (short) 1);
    }

}

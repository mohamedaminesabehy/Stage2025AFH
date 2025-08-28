package com.afh.gescomp.implementation;

import com.afh.gescomp.dto.MrcLotDto;
import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.repository.primary.MarcheRepository;
import com.afh.gescomp.repository.primary.MrcLotRepository;
import com.afh.gescomp.repository.primary.PrmLotRepository;
import com.afh.gescomp.repository.primary.PrmTypeLotRepository;
import com.afh.gescomp.service.MrcLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.ArrayList;
import java.util.List;


@Service
public class MrcLotServiceImpl implements MrcLotService {

    @Autowired
    private MrcLotRepository mrcLotRepository;

    @Autowired
    private MarcheRepository marcheRepository;

    @Autowired
    private PrmLotRepository prmLotRepository;


    @Override
    public List<MrcLot> getMrcLotsByNumMarche(Long numMarche) {
        return mrcLotRepository.getMrcLotsByNumMarche(numMarche);
    }

    @Override
    @Transactional
    public void deleteMrcLot(MrcLotId mrcLotId) {
        if (!mrcLotRepository.exists(mrcLotId)) {
            throw new RuntimeException("MrcLot not found");
        }
        mrcLotRepository.delete(mrcLotId);
    }

    @Override
    public MrcLot findMrcLotByIdLot(String idLot) {
        return mrcLotRepository.findByIdLot(idLot);
    }

    @Override
    public MrcLot getMrcLotsByNumMarcheAndIdLot(Long numMarche, String idLot) {
        return mrcLotRepository.findByNumMarcheAndIdLot(numMarche, idLot);
    }

    @Transactional
    public List<MrcLot> saveMrcLots(Long numMarche, List<MrcLotDto> mrcLotDtos) {
        List<MrcLot> mrcLots = new ArrayList<>();

        for (MrcLotDto dto : mrcLotDtos) {
            mrcLots.add(saveMrcLot(numMarche, dto));
        }

        return mrcLots;
    }

    private MrcLot saveMrcLot(Long numMarche, MrcLotDto mrcLotDto) {
        PrmLot prmLot = prmLotRepository.findOne(mrcLotDto.getIdLot());

        Marche marche = marcheRepository.findById(numMarche);

        MrcLot mrcLot = new MrcLot();
        MrcLotId mrcLotId = new MrcLotId(numMarche, mrcLotDto.getIdLot());
        mrcLot.setId(mrcLotId);
        mrcLot.setNumMarche(marche);
        mrcLot.setIdTypeLot(prmLot.getIdTypeLot().getId());
        mrcLot.setDesignation(mrcLotDto.getDesignation());

        return mrcLotRepository.save(mrcLot);
    }
}

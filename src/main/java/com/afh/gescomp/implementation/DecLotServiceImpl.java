package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.DecLot;
import com.afh.gescomp.repository.primary.DecLotRepository;
import com.afh.gescomp.service.DecLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DecLotServiceImpl implements DecLotService {

    @Autowired
    private DecLotRepository decLotRepository;

    @Override
    public List<DecLot> findDecLotByNumMarcheAndNumPieceFournAndIdLot(Long numMarche, Long numPieceFourn, String idLot) {
        return decLotRepository.findById_NumMarcheAndId_NumPieceFournAndId_IdLot(numMarche, numPieceFourn, idLot);
    }
}

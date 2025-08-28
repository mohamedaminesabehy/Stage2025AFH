package com.afh.gescomp.implementation;

import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.DecMnt;
import com.afh.gescomp.payload.request.DecMntUpdateRequest;
import com.afh.gescomp.repository.primary.DecMntRepository;
import com.afh.gescomp.service.DecMntService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DecMntServiceImpl implements DecMntService {
    @Autowired
    private DecMntRepository decMntRepository;


    @Override
    public DecMnt findById(Long numMarche, Short numPieceFourn) {
        return decMntRepository.findById(numMarche, numPieceFourn);
    }

    @Override
    public DecMnt patchDecMntOrd(Long numMarche, Short numPieceFourn, DecMntUpdateRequest decMntToUpdate) {
        DecMnt decMnt = decMntRepository.findById(numMarche, numPieceFourn);
        if (decMnt == null) {
            // Lancer une exception personnalisée si le décompte n'existe pas
            throw new ResourceNotFoundException("Le decMnt avec numMarche=" + numMarche + " et numPieceFourn=" + numPieceFourn + " n'a pas été trouvé.");
        }
        decMnt.setDecFraisEnrg(decMntToUpdate.getUpdatedDecMntColumns().getDecFraisEnrg());
        decMnt.setDecAutreMnt(decMntToUpdate.getUpdatedDecMntColumns().getDecAutreMnt());
        decMntRepository.save(decMnt);
        return decMnt;
    }

    @Override
    public BigDecimal getPreviousDecTravauxNetAvantRtn(Long numMarche, Short numPieceFourn) {
        List<DecMnt> allDecMnts = decMntRepository.findByNumMarcheOrderByNumPieceFournAsc(numMarche);

        if (allDecMnts.isEmpty()) {
            return BigDecimal.ZERO;
        }
        for (int i = 0; i < allDecMnts.size(); i++) {
            if (allDecMnts.get(i).getNumPieceFourn().equals(numPieceFourn)) {
                if (i == 0) {
                    return BigDecimal.ZERO;
                }
                return allDecMnts.get(i - 1).getDecTravauxNetAvantRtn();
            }
        }
        return BigDecimal.ZERO;     }


}


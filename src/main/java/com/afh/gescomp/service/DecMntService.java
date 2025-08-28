package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.DecMnt;
import com.afh.gescomp.model.primary.DecMntId;
import com.afh.gescomp.model.primary.MrcArticle;
import com.afh.gescomp.payload.request.DecArticleUpdateRequest;
import com.afh.gescomp.payload.request.DecMntUpdateRequest;

import java.math.BigDecimal;

public interface DecMntService {
    DecMnt findById(Long numMarche, Short numPieceFourn);
    DecMnt patchDecMntOrd(Long numMarche, Short numPieceFourn, DecMntUpdateRequest decMntToUpdate);
    BigDecimal getPreviousDecTravauxNetAvantRtn(Long numMarche, Short numPieceFourn);
}

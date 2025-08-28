package com.afh.gescomp.service;

import com.afh.gescomp.dto.DecompteResponse;
import com.afh.gescomp.model.primary.Decompte;
import com.afh.gescomp.payload.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;

import java.util.Date;
import java.util.List;
import java.util.Map;

public interface DecompteService {
    List<Decompte> getDecompteByNumMarcheAndNumEtapeAndIdTypeDec(Long numMarche, Short numEtape, Long idTypeDec);
    DecompteResponse insertDecompte(Long numMarche, java.sql.Date datePiece, Long idTypeDec, Long numEtape, Short soldeAvance);
    void deleteDecompte(Long numMarche, Long numPieceFourn);
    String calculMontantDecAvanceDecompte(Long numMarche);
    List<Decompte> findDecomptesByNumMarche(Long numMarche);
    void updateExPen(Long numMarche, Short numPieceFourn, Long exPenValue);
    DecompteResponse UpdateDatePieceSoldeAvanceDecompte(Long numMarche, Short numPieceFourn, Date datePiece, Boolean soldeAvance);
    Short getNumDecompte(Long numMarche, Short numPieceFourn);
    ResponseEntity<?> getStatutFin(Long numMarche, Short numPieceFourn);
    Short getMaxNumDecompteForMarche(Long numMarche);
    Short getMaxNumPieceFournForMarche(Long numMarche);
    Map<String, Object> getDecompteCountGroupedByIdTypeDecAndNumMarcheAndNumEtape(Long numMarche, Short numEtape);
    ResponseEntity<MessageResponse> envoyerDecompteAuFinancier(Long numMarche, Short numPieceFourn, String numStruct, String nomUser);
    Short findMaxNumPieceFournForMarcheDecLrg(Long numMarche);
    Short findNumPieceFournByTypeDecNEtDer(Long numMarche);
    boolean isDateDecompteValide(Long numMarche, Date datePiece);
    boolean isDateDecompteValideForUpdate(Long numMarche, Date datePiece, Short numPieceFourn);
}

package com.afh.gescomp.dto;

import com.afh.gescomp.model.primary.TypePenalite;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DecPenaliteDTO {
    private Long numMarche;
    private Long numPieceFourn;
    private Long numPen;
    private Short numEtape;
    private TypePenalite idTypePen;
    private BigDecimal montantPenAutre;
    private Date datePen;
    private String designation;
    private Long ExPen;
}

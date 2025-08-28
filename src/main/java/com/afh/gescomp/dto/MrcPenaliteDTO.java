package com.afh.gescomp.dto;

import com.afh.gescomp.model.primary.MrcEtape;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MrcPenaliteDTO {
    private Long numMarche;
    private Long numPen;
    private Short numEtape;
    private Date datePen;
    private Long montantPen;
    private Integer idTypePen;
    private Short numPieceFourn;
}

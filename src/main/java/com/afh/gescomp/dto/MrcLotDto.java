package com.afh.gescomp.dto;

import com.afh.gescomp.model.primary.MrcLot;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MrcLotDto {
    private Long numMarche;
    private String idLot;
    private Long idTypeLot;
    private String designation;

}

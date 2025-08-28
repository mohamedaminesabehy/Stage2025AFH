package com.afh.gescomp.dto;

import com.afh.gescomp.model.primary.PrmTypeLot;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PrmLotDTO {
    private String idLot;
    private String designation;
    private PrmTypeLot idTypeLot;

}

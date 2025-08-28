package com.afh.gescomp.dto;

import com.afh.gescomp.model.primary.MrcEtape;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MrcEtapeRequest {

    private Long numMarche;
    private List<MrcEtape> etapes;
}

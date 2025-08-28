package com.afh.gescomp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MrcArticleIdDTO {
    private Short idArticle;
    private Integer ap;
    private String idLot;
    private Long numMarche;
}

package com.afh.gescomp.dto;

import com.afh.gescomp.model.primary.Article;
import com.afh.gescomp.model.primary.MrcArticleId;
import com.afh.gescomp.model.primary.MrcLot;
import com.afh.gescomp.model.primary.PrmTypeSerie;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class MrcArticleDTO {
    private MrcArticleIdDTO id;  // L'objet ID complet (composé)
    private NumArticleDTO numArticle;  // Peut être null
    private MrcLot mrcLot;      // Peut être null
    private BigDecimal tva;
    private BigDecimal quantite;
    private BigDecimal prixUnitaire;
    private Integer chAp;
    private String description;
    private String codeArticle;  // Peut être null
    private BigDecimal qteExte;    // Peut être null
    private Integer flagRapport; // Peut être null
    private PrmTypeSerie idTypeSerie; // Peut être
    private BigDecimal prixFourniture;
}

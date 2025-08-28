package com.afh.gescomp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ArticleDTO   implements Serializable{
    private String numArticle;
    //private String numArticlePart;
    private String numSectEco;
    private String numSSectEco;
    private String numFamille;
    private String numSFamille;
    private String libUnite;
    private String designation;
    private String designationFr;
    private Integer historique;
    private BigDecimal TVA;
    private Timestamp createdAt;

    public ArticleDTO(String numArticle, String designationFr, String designation) {
        this.numArticle = numArticle;
        this.designationFr = designationFr;
        this.designation = designation;
    }

}

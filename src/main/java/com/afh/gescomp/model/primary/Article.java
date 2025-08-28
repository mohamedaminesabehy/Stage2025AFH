package com.afh.gescomp.model.primary;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.Objects;

@Entity(name = "Article")
@Table(name = "PRM_ARTICLE",schema = "ACHAT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @Column(name = "NUM_ARTICLE")
    private String numArticle;
    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;
    @Column(name = "NUM_S_SECT_ECO")
    private Short numSSectEco;
    @Column(name = "NUM_FAMILLE")
    private Short numFamille;
    @Column(name = "NUM_S_FAMILLE")
    private Short numSFamille;
    @Column(name = "LIB_UNITE")
    private String libUnite;
    @Column(name = "TVA",precision = 4, scale = 2)
    private BigDecimal TVA;
    @Column(name = "DESIGNATION")
    private String designation;
    @Column(name = "DESIGNATION_FR")
    private String designationFr;
    @Column(name = "HISTORIQUE")
    private Integer historique;
    @Column(name = "CREATED_AT", columnDefinition = "TIMESTAMP(6) DEFAULT SYSTIMESTAMP", insertable = false, updatable = false)
    private Timestamp createdAt;

    // Relations avec les entités Secteur, SSecteur, Famille, et SsFamille
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "NUM_SECT_ECO", referencedColumnName = "NUM_SECT_ECO", insertable = false, updatable = false)
    private Secteur secteur; // Relation avec Secteur

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "NUM_SECT_ECO", referencedColumnName = "NUM_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_S_SECT_ECO", referencedColumnName = "NUM_S_SECT_ECO", insertable = false, updatable = false)
    })
    private SousSecteur sousSecteur; // Relation avec SousSecteur

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "NUM_SECT_ECO", referencedColumnName = "NUM_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_S_SECT_ECO", referencedColumnName = "NUM_S_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_FAMILLE", referencedColumnName = "NUM_FAMILLE", insertable = false, updatable = false)
    })
    private Famille famille;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumns({
            @JoinColumn(name = "NUM_SECT_ECO", referencedColumnName = "NUM_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_S_SECT_ECO", referencedColumnName = "NUM_S_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_FAMILLE", referencedColumnName = "NUM_FAMILLE", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_S_FAMILLE", referencedColumnName = "NUM_S_FAMILLE", insertable = false, updatable = false)
    })
    private SousFamille ssFamille;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Article article = (Article) o;
        return numArticle.equals(article.numArticle);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numArticle);
    }
}

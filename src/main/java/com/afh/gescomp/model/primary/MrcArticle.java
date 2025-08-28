package com.afh.gescomp.model.primary;

import javax.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * les lignes par marche
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "MrcArticle")
@Table(name = "MRC_ARTICLE", schema = "ACHAT")
public class MrcArticle implements Serializable {
    private static final long serialVersionUID = 5167796009149271898L;
    private MrcArticleId id;

    private Article numArticle;

    /**
     * identifiant du marche
     */
    private MrcLot mrcLot;

    private BigDecimal tva;

    private BigDecimal quantite;

    private BigDecimal remise;

    private BigDecimal prixUnitaire;

    private String codeArticle;

    private BigDecimal qteExte;

    private Integer flagRapport;

    /**
     * 0 si l'article n'est pas apro, 1 si oui
     */
    private Integer chAp;

    /**
     * OBSERVATION REGLEMENT D2FINITIF
     */
    private String observLm;

    private BigDecimal pctFodec;

    /**
     * -0.001;0.001
     */
    private BigDecimal mntTvaMill;

    /**
     * 1 : article maintenance , 0 article travaux
     */
    private Integer arMaint;

    private PrmTypeSerie idTypeSerie;

    private BigDecimal prixFourniture;

    private BigDecimal mntHt;

    private BigDecimal mntTva;

    private BigDecimal mntTtc;

    private String codeFamille;

    private String description;

    @EmbeddedId
    public MrcArticleId getId() {
        return id;
    }

    @MapsId("numArticle")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "NUM_ARTICLE", nullable = false)
    public Article getNumArticle() {
        return numArticle;
    }

    @MapsId("id")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "NUM_MARCHE", referencedColumnName = "NUM_MARCHE"),
            @JoinColumn(name = "ID_LOT", referencedColumnName = "ID_LOT")
    })
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    public MrcLot getMrcLot() {
        return mrcLot;
    }

    @Column(name = "TVA", precision = 4, scale = 2)
    public BigDecimal getTva() {
        return tva;
    }

    @Column(name = "QUANTITE", precision = 10, scale = 3)
    public BigDecimal getQuantite() {
        return quantite;
    }

    @Column(name = "REMISE", precision = 4, scale = 2)
    public BigDecimal getRemise() {
        return remise;
    }

    @Column(name = "PRIX_UNITAIRE", precision = 12, scale = 3)
    public BigDecimal getPrixUnitaire() {
        return prixUnitaire;
    }

    @Size(max = 20)
    @Column(name = "CODE_ARTICLE", length = 20)
    public String getCodeArticle() {
        return codeArticle;
    }

    @Column(name = "QTE_EXTE", precision = 10, scale = 3)
    public BigDecimal getQteExte() {
        return qteExte;
    }

    @ColumnDefault("1")
    @Column(name = "FLAG_RAPPORT")
    public Integer getFlagRapport() {
        return flagRapport;
    }

    @ColumnDefault("0")
    @Column(name = "CH_AP")
    public Integer getChAp() {
        return chAp;
    }

    @Size(max = 2000)
    @Column(name = "OBSERV_LM", length = 2000)
    public String getObservLm() {
        return observLm;
    }

    @ColumnDefault("0")
    @Column(name = "PCT_FODEC", precision = 4, scale = 2)
    public BigDecimal getPctFodec() {
        return pctFodec;
    }

    @Column(name = "MNT_TVA_MILL", precision = 12, scale = 3)
    public BigDecimal getMntTvaMill() {
        return mntTvaMill;
    }

    @ColumnDefault("0")
    @Column(name = "AR_MAINT")
    public Integer getArMaint() {
        return arMaint;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "ID_TYPE_SERIE")
    public PrmTypeSerie getIdTypeSerie() {
        return idTypeSerie;
    }

    @Column(name = "PRIX_FOURNITURE", precision = 38, scale = 5)
    public BigDecimal getPrixFourniture() {
        return prixFourniture;
    }

    @Column(name = "MNT_HT", precision = 32, scale = 5)
    public BigDecimal getMntHt() {
        return mntHt;
    }

    @Column(name = "MNT_TVA", precision = 32, scale = 5)
    public BigDecimal getMntTva() {
        return mntTva;
    }

    @Column(name = "MNT_TTC", precision = 32, scale = 5)
    public BigDecimal getMntTtc() {
        return mntTtc;
    }

    @Size(max = 100)
    @Column(name = "CODE_FAMILLE", length = 100)
    public String getCodeFamille() {
        return codeFamille;
    }

    @Size(max = 100)
    @Column(name = "DESCRIPTION", length = 100)
    public String getDescription() {
        return description;
    }

}
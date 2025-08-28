package com.afh.gescomp.model.primary;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Set;

/**
 * les lignes par decompte/facture
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "DecArticle")
@Table(name = "DEC_ARTICLE", schema = "ACHAT")
public class DecArticle implements Serializable {
    private static final long serialVersionUID = -4374735917702992939L;
    private DecArticleId id;

    private Decompte decompte;

    private BigDecimal tva;

    private BigDecimal quantite;

    private BigDecimal remise;

    private BigDecimal prixUnitaire;

    private BigDecimal pctRea;

    private String typeLot;

    private String obs;

    private String codeArticle;

    private BigDecimal pctFodec;

    private BigDecimal prixUnitaireDef;

    private BigDecimal travMntHt;

    private BigDecimal mntHtRemise;

    private BigDecimal indice;

    private BigDecimal mntHtFodec;

    private BigDecimal travMntTva;

    private BigDecimal mntTtc;

    private BigDecimal mntTvaMill;

    private BigDecimal mntFodec;

    private PrmTypeSerie idTypeSerie;

    private BigDecimal mntFluct;

    private BigDecimal mntRemise;

    private BigDecimal aprMntHt;

    private BigDecimal aprMntTva;

    private BigDecimal fluctMntHt;

    private BigDecimal fluctMntTva;

    private BigDecimal quantiteRea;

    private BigDecimal travHtRea;

    private String libUnite;

    private String designationFr;

    private BigDecimal quantiteMrc;

    private BigDecimal quantitePrec;

    @Column(name = "QUANTITE_PREC", precision = 32, scale = 3)
    public BigDecimal getQuantitePrec() {
        return quantitePrec;
    }

    @Column(name = "QUANTITE_MRC", precision = 32, scale = 3)
    public BigDecimal getQuantiteMrc() {
        return quantiteMrc;
    }

    @Size(max = 1000)
    @Column(name = "DESIGNATION_FR", length = 1000)
    public String getDesignationFr() {
        return designationFr;
    }

    @Size(max = 10)
    @Column(name = "LIB_UNITE", length = 10)
    public String getLibUnite() {
        return libUnite;
    }

    @Column(name = "TRAV_HT_REA", precision = 32, scale = 3)
    public BigDecimal getTravHtRea() {
        return travHtRea;
    }

    @Column(name = "QUANTITE_REA", precision = 32, scale = 3)
    public BigDecimal getQuantiteRea() {
        return quantiteRea;
    }

    @Column(name = "FLUCT_MNT_TVA", precision = 38, scale = 5)
    public BigDecimal getFluctMntTva() {
        return fluctMntTva;
    }

    @Column(name = "FLUCT_MNT_HT", precision = 38, scale = 5)
    public BigDecimal getFluctMntHt() {
        return fluctMntHt;
    }

    @Column(name = "APR_MNT_TVA", precision = 38, scale = 5)
    public BigDecimal getAprMntTva() {
        return aprMntTva;
    }

    @Column(name = "APR_MNT_HT", precision = 38, scale = 5)
    public BigDecimal getAprMntHt() {
        return aprMntHt;
    }

    @Column(name = "MNT_REMISE", precision = 38, scale = 5)
    public BigDecimal getMntRemise() {
        return mntRemise;
    }

    @Column(name = "MNT_FLUCT", precision = 38, scale = 5)
    public BigDecimal getMntFluct() {
        return mntFluct;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TYPE_SERIE")
    public PrmTypeSerie getIdTypeSerie() {
        return idTypeSerie;
    }

    @Column(name = "MNT_FODEC", precision = 12, scale = 3)
    public BigDecimal getMntFodec() {
        return mntFodec;
    }

    @Column(name = "MNT_TVA_MILL", precision = 12, scale = 4)
    public BigDecimal getMntTvaMill() {
        return mntTvaMill;
    }

    @Column(name = "MNT_TTC", precision = 12, scale = 4)
    public BigDecimal getMntTtc() {
        return mntTtc;
    }

    @Column(name = "TRAV_MNT_TVA", precision = 12, scale = 4)
    public BigDecimal getTravMntTva() {
        return travMntTva;
    }

    @Column(name = "MNT_HT_FODEC", precision = 12, scale = 4)
    public BigDecimal getMntHtFodec() {
        return mntHtFodec;
    }

    @Column(name = "INDICE", precision = 13, scale = 7)
    public BigDecimal getIndice() {
        return indice;
    }

    @Column(name = "MNT_HT_REMISE", precision = 12, scale = 3)
    public BigDecimal getMntHtRemise() {
        return mntHtRemise;
    }

    @Column(name = "TRAV_MNT_HT", precision = 22, scale = 5)
    public BigDecimal getTravMntHt() {
        return travMntHt;
    }

    @Column(name = "PRIX_UNITAIRE_DEF", precision = 12, scale = 3)
    public BigDecimal getPrixUnitaireDef() {
        return prixUnitaireDef;
    }

    @Column(name = "PCT_FODEC", precision = 4, scale = 2)
    public BigDecimal getPctFodec() {
        return pctFodec;
    }

    @Size(max = 20)
    @Column(name = "CODE_ARTICLE", length = 20)
    public String getCodeArticle() {
        return codeArticle;
    }

    @Size(max = 120)
    @Column(name = "OBS", length = 120)
    public String getObs() {
        return obs;
    }

    @Size(max = 10)
    @Column(name = "TYPE_LOT", length = 10)
    public String getTypeLot() {
        return typeLot;
    }

    @NotNull
    @Column(name = "PCT_REA", nullable = false, precision = 5, scale = 2)
    public BigDecimal getPctRea() {
        return pctRea;
    }

    @Column(name = "PRIX_UNITAIRE", precision = 12, scale = 3)
    public BigDecimal getPrixUnitaire() {
        return prixUnitaire;
    }

    @Column(name = "REMISE", precision = 4, scale = 2)
    public BigDecimal getRemise() {
        return remise;
    }

    @Column(name = "QUANTITE", precision = 10, scale = 3)
    public BigDecimal getQuantite() {
        return quantite;
    }

    @Column(name = "TVA", precision = 4, scale = 2)
    public BigDecimal getTva() {
        return tva;
    }

    @MapsId("id")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns({
            @JoinColumn(name = "NUM_MARCHE", referencedColumnName = "NUM_MARCHE", nullable = false),
            @JoinColumn(name = "NUM_PIECE_FOURN", referencedColumnName = "NUM_PIECE_FOURN", nullable = false)
    })
    public Decompte getDecompte() {
        return decompte;
    }

    @EmbeddedId
    public DecArticleId getId() {
        return id;
    }

}
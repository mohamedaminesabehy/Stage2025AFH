package com.afh.gescomp.model.primary;

import lombok.*;
import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "DecMnt")
@Table(name = "DEC_MNT", schema = "ACHAT")
@IdClass(DecMntId.class)
public class DecMnt implements Serializable {
    private static final long serialVersionUID = 3486743593391469100L;

    @Id
    @Column(name = "NUM_MARCHE", nullable = false)
    private Long numMarche;

    @Id
    @Column(name = "NUM_PIECE_FOURN", nullable = false)
    private Short numPieceFourn;

    // If you explicitly want to control the column name mapping, use @Column:
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns({
            @JoinColumn(name = "NUM_MARCHE", referencedColumnName = "NUM_MARCHE", nullable = false, insertable = false,updatable = false),
            @JoinColumn(name = "NUM_PIECE_FOURN", referencedColumnName = "NUM_PIECE_FOURN", nullable = false,insertable = false,updatable = false)
    })
    private Decompte decompte;

    @Column(name = "DEC_TRAVAUX_NET_AVANT_RTN", precision = 20, scale = 5)
    private BigDecimal decTravauxNetAvantRtn;

    @Column(name = "DATE_PIECE")
    private Date datePiece;

    @Column(name = "DEC_CAUT_TOTAL", precision = 38, scale = 5)
    private BigDecimal decCautTotal;

    @Column(name = "DEC_CAUT_CUM", precision = 38, scale = 5)
    private BigDecimal decCautCum;

    @Column(name = "DEC_TRAVAUX_HT", precision = 38, scale = 5)
    private BigDecimal decTravauxHt;

    @Column(name = "DEC_TRAVAUX_TVA", precision = 38, scale = 5)
    private BigDecimal decTravauxTva;

    @Column(name = "DEC_APRO_HT", precision = 38, scale = 5)
    private BigDecimal decAproHt;

    @Column(name = "DEC_APRO_TVA", precision = 38, scale = 5)
    private BigDecimal decAproTva;

    @Column(name = "DEC_APRO_TTC", precision = 38, scale = 5)
    private BigDecimal decAproTtc;

    @Column(name = "DEC_TRAVAUX_TTC", precision = 38, scale = 5)
    private BigDecimal decTravauxTtc;

    @Column(name = "DEC_APRO", precision = 38, scale = 5)
    private BigDecimal decApro;

    @Column(name = "DEC_RET_AV", precision = 38, scale = 5)
    private BigDecimal decRetAv;

    @Column(name = "DEC_RET_CAUT", precision = 38, scale = 5)
    private BigDecimal decRetCaut;

    @Column(name = "DEC_IMPOSABLE", precision = 38, scale = 5)
    private BigDecimal decImposable;

    @Column(name = "DEC_IMPOSABLE_PREC", precision = 38, scale = 5)
    private BigDecimal decImposablePrec;

    @Column(name = "DEC_RTVA", precision = 38, scale = 5)
    private BigDecimal decRtva;

    @Column(name = "DEC_IR", precision = 38, scale = 5)
    private BigDecimal decIr;

    @Column(name = "DEC_PENALITE", precision = 38, scale = 5)
    private BigDecimal decPenalite;

    @Column(name = "DEC_TRAVAUX_REMISE", precision = 38, scale = 5)
    private BigDecimal decTravauxRemise;

    @Column(name = "DEC_FLUCT_TTC", precision = 38, scale = 5)
    private BigDecimal decFluctTtc;

    @Column(name = "DEC_TIMBRE", precision = 38, scale = 5)
    private BigDecimal decTimbre;

    @Column(name = "DEC_TRAVAUX_HT_APRES_REMISE", precision = 38, scale = 5)
    private BigDecimal decTravauxHtApresRemise;

    @Column(name = "DEC_IMPOSABLE_NET_APRES_RTN", precision = 38, scale = 5)
    private BigDecimal decImposableNetApresRtn;

    @Column(name = "DEC_AVANCE", precision = 38, scale = 3)
    private BigDecimal decAvance;

    @Column(name = "DEC_FLUCT_REMISE", precision = 38, scale = 3)
    private BigDecimal decFluctRemise;

    @Column(name = "DEC_FLUCT_HT", precision = 38, scale = 5)
    private BigDecimal decFluctHt;

    @Column(name = "DEC_FLUCT_HT_APRES_REMISE", precision = 38, scale = 5)
    private BigDecimal decFluctHtApresRemise;

    @Column(name = "DEC_FLUCT_TVA", precision = 38, scale = 5)
    private BigDecimal decFluctTva;

    @Column(name = "DEC_FLUCT_NET", precision = 38, scale = 5)
    private BigDecimal decFluctNet;

    @Column(name = "DEC_AVANCE_NET", precision = 38, scale = 5)
    private BigDecimal decAvanceNet;

    @Column(name = "DEC_HT", precision = 38, scale = 5)
    private BigDecimal decHt;

    @Column(name = "DEC_TVA", precision = 38, scale = 5)
    private BigDecimal decTva;

    @Column(name = "DEC_TTC", precision = 38, scale = 5)
    private BigDecimal decTtc;

    @Column(name = "DEC_FRAIS_ENRG", precision = 12, scale = 3)
    private BigDecimal decFraisEnrg;

    @Column(name = "DEC_AUTRE_MNT", precision = 12, scale = 3)
    private BigDecimal decAutreMnt;

    @Column(name = "DEC_TRAVAUX_TVA_AVANT_REMISE", precision = 32, scale = 3)
    private BigDecimal decTravauxTvaAvantRemise;

    @Column(name = "DEC_APRO_TVA_AVANT_REMISE", precision = 32, scale = 3)
    private BigDecimal decAproTvaAvantRemise;

    @Column(name = "DEC_APRO_HT_APRES_REMISE", precision = 32, scale = 3)
    private BigDecimal decAproHtApresRemise;

    @Column(name = "DEC_APRO_REMISE", precision = 32, scale = 3)
    private BigDecimal decAproRemise;

    @Column(name = "DEC_RET_AV_FICH", precision = 32, scale = 3)
    private BigDecimal decRetAvFich;

    @Column(name = "DEC_RET_GAR_FICH", precision = 32, scale = 3)
    private BigDecimal decRetGarFich;

    @Column(name = "DEC_MNT_DIFFERENCE", precision = 32, scale = 3)
    private BigDecimal decMntDifference;

    @Column(name = "MNT_NET_CHIFFRE" , length = 300)
    private String mntNetChiffre;

    private String afficheCb;

    @Size(max = 100)
    @Column(name = "AFFICHE_CB", length = 100)
    public String getAfficheCb() { return afficheCb; }

    @Column(name = "DEC_DEP_TT", precision = 38, scale = 5)
    private BigDecimal decDepTt;

    @Column(name = "DEC_RET_TT", precision = 38, scale = 5)
    private BigDecimal decRetTt;

    @Column(name = "DEC_TV_APR_GAR", precision = 38, scale = 5)
    private BigDecimal decTvAprGar;

    @Column(name = "DEC_TRV_APRO", precision = 38, scale = 5)
    private BigDecimal decTrvApro;

    @Column(name = "DEC_TT_AV", precision = 38, scale = 5)
    private BigDecimal decTtAv;

    @Column(name = "DEC_AV_PAY", precision = 38, scale = 5)
    private BigDecimal decAvPay;
}

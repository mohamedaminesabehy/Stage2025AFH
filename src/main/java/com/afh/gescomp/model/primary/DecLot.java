package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "DecLot")
@Table(name = "DEC_LOT", schema = "ACHAT")
public class DecLot implements Serializable {
    private static final long serialVersionUID = 3946369238460561951L;
    private DecLotId id;

    private Decompte decompte;

    private BigDecimal decTravauxHtParLotTva;

    private BigDecimal decAproHtParLotTva;

    private BigDecimal decFluctHtParLotTva;

    private BigDecimal decTravauxHtParLot;

    private BigDecimal decTravauxTvaParLot;

    private BigDecimal decTravauxTtcParLot;

    private BigDecimal decAproHtParLot;

    private BigDecimal decAproTvaParLot;

    private BigDecimal decAproTtcParLot;

    @EmbeddedId
    public DecLotId getId() {
        return id;
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

    @Column(name = "DEC_TRAVAUX_HT_PAR_LOT_TVA", precision = 38, scale = 5)
    public BigDecimal getDecTravauxHtParLotTva() {
        return decTravauxHtParLotTva;
    }

    @Column(name = "DEC_APRO_HT_PAR_LOT_TVA", precision = 38, scale = 5)
    public BigDecimal getDecAproHtParLotTva() {
        return decAproHtParLotTva;
    }

    @Column(name = "DEC_FLUCT_HT_PAR_LOT_TVA", precision = 38, scale = 5)
    public BigDecimal getDecFluctHtParLotTva() {
        return decFluctHtParLotTva;
    }

    @Column(name = "DEC_TRAVAUX_HT_PAR_LOT", precision = 32, scale = 3)
    public BigDecimal getDecTravauxHtParLot() {
        return decTravauxHtParLot;
    }

    @Column(name = "DEC_TRAVAUX_TVA_PAR_LOT", precision = 38, scale = 5)
    public BigDecimal getDecTravauxTvaParLot() {
        return decTravauxTvaParLot;
    }

    @Column(name = "DEC_TRAVAUX_TTC_PAR_LOT", precision = 38, scale = 8)
    public BigDecimal getDecTravauxTtcParLot() {
        return decTravauxTtcParLot;
    }

    @Column(name = "DEC_APRO_HT_PAR_LOT", precision = 38, scale = 5)
    public BigDecimal getDecAproHtParLot() {
        return decAproHtParLot;
    }

    @Column(name = "DEC_APRO_TVA_PAR_LOT", precision = 38, scale = 5)
    public BigDecimal getDecAproTvaParLot() {
        return decAproTvaParLot;
    }

    @Column(name = "DEC_APRO_TTC_PAR_LOT", precision = 38, scale = 5)
    public BigDecimal getDecAproTtcParLot() {
        return decAproTtcParLot;
    }

}
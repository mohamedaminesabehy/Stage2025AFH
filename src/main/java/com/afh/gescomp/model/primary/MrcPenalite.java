package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Date;

/**
 * les penalites par marche
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "MrcPenalite")
@Table(name = "MRC_PENALITE", schema = "ACHAT")
public class MrcPenalite implements Serializable {
    private static final long serialVersionUID = -6666491659681358198L;
    private MrcPenaliteId id;

    private Short numEtape;

    private MrcEtape mrcEtape;
    /**
     * date d'application de la penalite
     */
    private Date datePen;

    /**
     * montant de la penalite
     */
    private Long montantPen;

    /**
     * TYPE PEN
     */
    private Integer idTypePen;

    private Short numPieceFourn;

    @EmbeddedId
    public MrcPenaliteId getId() {
        return id;
    }

    @MapsId("id")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns({
            @JoinColumn(name = "NUM_MARCHE", referencedColumnName = "NUM_MARCHE", nullable = false),
            @JoinColumn(name = "NUM_ETAPE", referencedColumnName = "NUM_ETAPE", nullable = false)
    })
    public MrcEtape getMrcEtape() {return mrcEtape; }

    @NotNull
    @Column(name = "NUM_ETAPE", nullable = false)
    public Short getNumEtape() {
        return numEtape;
    }

    @NotNull
    @Column(name = "DATE_PEN", nullable = false)
    public Date getDatePen() {
        return datePen;
    }

    @NotNull
    @Column(name = "MONTANT_PEN", nullable = false)
    public Long getMontantPen() {
        return montantPen;
    }


    @Column(name = "ID_TYPE_PEN")
    public Integer getIdTypePen() {
        return idTypePen;
    }

    @Column(name = "NUM_PIECE_FOURN")
    public Short getNumPieceFourn() {
        return numPieceFourn;
    }


}
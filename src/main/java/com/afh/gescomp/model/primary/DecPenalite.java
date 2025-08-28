package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "DecPenalite")
@Table(name = "DEC_PENALITE", schema = "ACHAT")
public class DecPenalite implements Serializable {
    private static final long serialVersionUID = 2144668749912068497L;
    private DecPenaliteId id;

    //private MrcPenalite mrcPenalite;

    private TypePenalite idTypePen;

    private BigDecimal montantPenAutre;

    private Date datePen;

    private String designation;

    private Short numEtape;

    private Decompte decompte;



    @EmbeddedId
    public DecPenaliteId getId() {
        return id;
    }

    @MapsId("id")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumns({
            @JoinColumn(name = "NUM_MARCHE", referencedColumnName = "NUM_MARCHE", nullable = false),
            @JoinColumn(name = "NUM_PIECE_FOURN", referencedColumnName = "NUM_PIECE_FOURN", nullable = false)
    })
    public Decompte getDecompte() {
        return decompte;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_TYPE_PEN")
    public TypePenalite getIdTypePen() {
        return idTypePen;
    }

    @Column(name = "MNT_PEN_AUTRE", precision = 38, scale = 5)
    public BigDecimal getMontantPenAutre() {
        return montantPenAutre;
    }

    @Column(name = "DATE_PEN")
    public Date getDatePen() {
        return datePen;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

    @Column(name = "NUM_ETAPE")
    public Short getNumEtape() {
        return numEtape;
    }

}
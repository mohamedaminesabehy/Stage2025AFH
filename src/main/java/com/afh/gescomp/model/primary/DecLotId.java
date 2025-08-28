package com.afh.gescomp.model.primary;

import lombok.*;
import org.hibernate.Hibernate;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Embeddable
public class DecLotId implements Serializable {
    private static final long serialVersionUID = -8418123529616856542L;
    private Long numMarche;

    private Long numPieceFourn;

    private String idLot;

    private BigDecimal tva;

    @NotNull
    @Column(name = "NUM_MARCHE", nullable = false)
    public Long getNumMarche() {
        return numMarche;
    }

    @NotNull
    @Column(name = "NUM_PIECE_FOURN", nullable = false)
    public Long getNumPieceFourn() {
        return numPieceFourn;
    }

    @Size(max = 100)
    @NotNull
    @Column(name = "ID_LOT", nullable = false, length = 100)
    public String getIdLot() {
        return idLot;
    }

    @NotNull
    @Column(name = "TVA", nullable = false, precision = 6, scale = 2)
    public BigDecimal getTva() {
        return tva;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        DecLotId entity = (DecLotId) o;
        return Objects.equals(this.idLot, entity.idLot) &&
                Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numPieceFourn, entity.numPieceFourn) &&
                Objects.equals(this.tva, entity.tva);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idLot, numMarche, numPieceFourn, tva);
    }

}
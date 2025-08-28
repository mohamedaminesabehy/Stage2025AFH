package com.afh.gescomp.model.primary;

import lombok.*;
import org.hibernate.Hibernate;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Embeddable
public class DecompteId implements Serializable {
    private static final long serialVersionUID = 7081239250996031628L;
    /**
     * identifiant du marche
     */
    private Long numMarche;

    /**
     * numero de la piece
     */
    private Short numPieceFourn;

    @NotNull
    @Column(name = "NUM_MARCHE", nullable = false)
    public Long getNumMarche() {
        return numMarche;
    }

    @NotNull
    @Column(name = "NUM_PIECE_FOURN", nullable = false)
    public Short getNumPieceFourn() {
        return numPieceFourn;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        DecompteId entity = (DecompteId) o;
        return Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numPieceFourn, entity.numPieceFourn);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numMarche, numPieceFourn);
    }

}
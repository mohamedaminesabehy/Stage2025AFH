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
public class DecPenaliteId implements Serializable {
    private static final long serialVersionUID = 301140915282996750L;
    private Long numMarche;

    private Long numPieceFourn;

    private Long numPen;

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

    @NotNull
    @Column(name = "NUM_PEN", nullable = false)
    public Long getNumPen() {
        return numPen;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        DecPenaliteId entity = (DecPenaliteId) o;
        return Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numPieceFourn, entity.numPieceFourn) &&
                Objects.equals(this.numPen, entity.numPen);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numMarche, numPieceFourn, numPen);
    }

}
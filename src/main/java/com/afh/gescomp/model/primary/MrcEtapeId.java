package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Embeddable
public class MrcEtapeId implements Serializable {
    private static final long serialVersionUID = 3052691870482560165L;
    /**
     * identifiant du marche
     */
    private Long numMarche;

    private Short numEtape;

    @NotNull
    @Column(name = "NUM_MARCHE", nullable = false)
    public Long getNumMarche() {
        return numMarche;
    }

    @NotNull
    @Column(name = "NUM_ETAPE", nullable = false)
    public Short getNumEtape() {
        return numEtape;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        MrcEtapeId entity = (MrcEtapeId) o;
        return Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numEtape, entity.numEtape);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numMarche, numEtape);
    }

}
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
public class MrcGarantieId implements Serializable {
    private static final long serialVersionUID = 4222898000889094640L;
    private Long numMarche;

    private Long numGarantie;

    private Long idTypeGarantie;

    @NotNull
    @Column(name = "NUM_MARCHE", nullable = false)
    public Long getNumMarche() {
        return numMarche;
    }

    @NotNull
    @Column(name = "NUM_GARANTIE", nullable = false)
    public Long getNumGarantie() {
        return numGarantie;
    }

    @NotNull
    @Column(name = "ID_TYPE_GARANTIE", nullable = false)
    public Long getIdTypeGarantie() {
        return idTypeGarantie;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        MrcGarantieId entity = (MrcGarantieId) o;
        return Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numGarantie, entity.numGarantie) &&
                Objects.equals(this.idTypeGarantie, entity.idTypeGarantie);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numMarche, numGarantie, idTypeGarantie);
    }

}
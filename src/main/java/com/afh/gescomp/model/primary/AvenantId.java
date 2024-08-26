package com.afh.gescomp.model.primary;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class AvenantId implements Serializable {
    private static final long serialVersionUID = -5294792466661841516L;
    /**
     * identifiant du marche
     */
    private String numMarche;

    /**
     * numero sequentiel de l'avenant dans le marche
     */
    private Short numAvenant;

    @Size(max = 13)
    @NotNull
    @Column(name = "NUM_MARCHE", nullable = false, length = 13)
    public String getNumMarche() {
        return numMarche;
    }

    @NotNull
    @Column(name = "NUM_AVENANT", nullable = false)
    public Short getNumAvenant() {
        return numAvenant;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        AvenantId entity = (AvenantId) o;
        return Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numAvenant, entity.numAvenant);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numMarche, numAvenant);
    }

}
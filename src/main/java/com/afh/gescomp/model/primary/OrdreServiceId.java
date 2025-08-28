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
public class OrdreServiceId implements Serializable {
    private static final long serialVersionUID = -4815205029452376178L;
    /**
     * identifiant du marche
     */
    private Long numMarche;

    private Short numEtape;

    /**
     * identifiant de l'OS
     */
    private Integer numOs;

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

    @NotNull
    @Column(name = "NUM_OS", nullable = false)
    public Integer getNumOs() {
        return numOs;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        OrdreServiceId entity = (OrdreServiceId) o;
        return Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numEtape, entity.numEtape) &&
                Objects.equals(this.numOs, entity.numOs);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numMarche, numEtape, numOs);
    }

}
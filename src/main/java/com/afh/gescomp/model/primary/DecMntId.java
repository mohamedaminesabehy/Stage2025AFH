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
public class DecMntId implements Serializable {
    private static final long serialVersionUID = 6460635121944560928L;
    private Long numMarche;
    private Short numPieceFourn;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        DecMntId entity = (DecMntId) o;
        return Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.numPieceFourn, entity.numPieceFourn);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numMarche, numPieceFourn);
    }

}
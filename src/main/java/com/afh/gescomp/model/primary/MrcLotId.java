package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
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
public class MrcLotId implements Serializable {
    private static final long serialVersionUID = 7565948076083719740L;
    private Long numMarche;

    private String idLot;

    @NotNull
    @Column(name = "NUM_MARCHE", nullable = false)
    public Long getNumMarche() {
        return numMarche;
    }

    @Size(max = 22)
    @NotNull
    @Column(name = "ID_LOT", nullable = false, length = 22)
    public String getIdLot() {
        return idLot;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        MrcLotId entity = (MrcLotId) o;
        return Objects.equals(this.idLot, entity.idLot) &&
                Objects.equals(this.numMarche, entity.numMarche);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idLot, numMarche);
    }

}
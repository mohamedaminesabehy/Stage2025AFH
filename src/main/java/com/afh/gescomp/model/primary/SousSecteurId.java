package com.afh.gescomp.model.primary;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SousSecteurId implements Serializable {

    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;
    @Column(name = "NUM_S_SECT_ECO")
    private Short numSSectEco;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SousSecteurId that = (SousSecteurId) o;
        return Objects.equals(numSectEco, that.numSectEco) && Objects.equals(numSSectEco, that.numSSectEco);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numSectEco, numSSectEco);
    }
}

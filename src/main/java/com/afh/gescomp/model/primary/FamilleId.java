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
public class FamilleId implements Serializable {
    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;
    @Column(name = "NUM_S_SECT_ECO")
    private Short numSSectEco;
    @Column(name = "NUM_FAMILLE")
    private Short numFamille;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FamilleId familleId = (FamilleId) o;
        return Objects.equals(numSectEco, familleId.numSectEco) && Objects.equals(numSSectEco, familleId.numSSectEco) && Objects.equals(numFamille, familleId.numFamille);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numSectEco, numSSectEco, numFamille);
    }
}

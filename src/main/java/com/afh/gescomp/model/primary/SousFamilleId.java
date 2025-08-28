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
public class SousFamilleId  implements Serializable {
    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;
    @Column(name = "NUM_S_SECT_ECO")
    private Short numSSectEco;
    @Column(name = "NUM_FAMILLE")
    private Short numFamille;
    @Column(name = "NUM_S_FAMILLE")
    private Short numSFamille;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SousFamilleId that = (SousFamilleId) o;
        return Objects.equals(numSectEco, that.numSectEco) && Objects.equals(numSSectEco, that.numSSectEco) && Objects.equals(numFamille, that.numFamille) && Objects.equals(numSFamille, that.numSFamille);
    }

    @Override
    public int hashCode() {
        return Objects.hash(numSectEco, numSSectEco, numFamille, numSFamille);
    }
}

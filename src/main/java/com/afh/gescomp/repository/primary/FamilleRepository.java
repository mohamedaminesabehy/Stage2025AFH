package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Famille;
import com.afh.gescomp.model.primary.FamilleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FamilleRepository extends JpaRepository<Famille, FamilleId> {
    List<Famille> findByNumSectEcoAndNumSSectEco(Short numSectEco, Short numSSectEco);

    @Query("SELECT f.designation FROM Famille f WHERE f.numFamille = :numFamille AND f.numSSectEco = :numSSectEco AND f.numSectEco = :numSectEco")
    String findDesignationByNumFamille(@Param("numFamille") Short numFamille, @Param("numSSectEco") Short numSSectEco, @Param("numSectEco") Short numSectEco);

    @Query("SELECT f.numFamille FROM Famille f WHERE f.designation = :designation and f.numSectEco = :numSectEco and f.numSSectEco = :numSSectEco")
    Short findFamilleByDesignation(@Param("designation") String designation,@Param("numSectEco") Short numSectEco,@Param("numSSectEco") Short numSSectEco);
}
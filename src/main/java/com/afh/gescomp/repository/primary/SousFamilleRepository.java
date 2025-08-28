package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.SousFamille;
import com.afh.gescomp.model.primary.SousFamilleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface SousFamilleRepository extends JpaRepository<SousFamille, SousFamilleId> {
    List<SousFamille> findByNumSectEcoAndNumSSectEcoAndNumFamille(Short numSectEco, Short numSSectEco, Short numFamille);

    @Query("SELECT sf.designation FROM SOUS_FAMILLE sf WHERE sf.numSFamille = :numSFamille AND sf.numFamille = :numFamille AND sf.numSSectEco = :numSSectEco AND sf.numSectEco = :numSectEco")
    String findDesignationByNumSFamille(@Param("numSFamille") Short numSFamille, @Param("numFamille") Short numFamille, @Param("numSSectEco") Short numSSectEco, @Param("numSectEco") Short numSectEco);

    @Query("SELECT sf.numSFamille FROM SOUS_FAMILLE sf WHERE sf.designation = :designation and sf.numSectEco = :nvNumSecteur and sf.numSSectEco = :nvNumSSecteur and sf.numFamille = :nvNumFamille")
    List<Short> findSFamilleByDesignation(@Param("designation") String designation, @Param("nvNumSecteur") Short nvNumSecteur, @Param("nvNumSSecteur") Short nvNumSSecteur, @Param("nvNumFamille") Short nvNumFamille);
}
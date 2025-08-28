package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.SousSecteur;
import com.afh.gescomp.model.primary.SousSecteurId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SousSecteurRepository extends JpaRepository<SousSecteur, SousSecteurId> {
    List<SousSecteur> findByNumSectEco(Short numSectEco);

    @Query("SELECT ss.designation FROM SOUS_SECTEUR ss WHERE ss.numSSectEco = :numSSectEco AND ss.numSectEco = :numSectEco")
    String findDesignationByNumSSectEco(@Param("numSSectEco") Short numSSectEco, @Param("numSectEco") Short numSectEco);

    @Query("SELECT ss.numSSectEco FROM SOUS_SECTEUR ss WHERE ss.designation LIKE %:designation%")
    Short findNumSSectEcoByDesignation(@Param("designation") String designation);

    @Query("SELECT ss.numSSectEco FROM SOUS_SECTEUR ss WHERE ss.designation = :designation AND ss.numSectEco = :numSectEco")
    Short findNumSSectEcoByNumSectEcoAndDesignation(@Param("designation") String designation, @Param("numSectEco") Short numSectEco);

    //boolean existsByNumSectEcoAndNumSSectEco(Short numSectEco, Short numSSectEco);
}
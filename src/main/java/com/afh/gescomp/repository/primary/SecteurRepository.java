package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.model.primary.Secteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SecteurRepository extends JpaRepository<Secteur, Short> {
    @Query("SELECT se.designation FROM SECT_ECO se WHERE se.numSectEco = :numSectEco")
    String findDesignationByNumSectEco(@Param("numSectEco") Short numSectEco);

    @Query("SELECT se.numSectEco FROM SECT_ECO se WHERE se.designation = :designation")
    Short findNumSectEcoByDesignation(@Param("designation") String designation);
}
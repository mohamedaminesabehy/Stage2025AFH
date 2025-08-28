package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.PrmStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PrmStructureRepository extends JpaRepository<PrmStructure, String>{
    @Query("SELECT prm FROM PrmStructure prm WHERE prm.numStruct = :numStruct")
    PrmStructure findPrmStructureByNumStruct(@Param("numStruct") String numStruct);
}
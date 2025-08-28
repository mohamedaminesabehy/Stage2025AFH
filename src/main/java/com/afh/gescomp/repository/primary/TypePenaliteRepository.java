package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.TypePenalite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TypePenaliteRepository extends JpaRepository<TypePenalite, Long> {
    List<TypePenalite> findAllByOrderByIdAsc();

}
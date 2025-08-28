package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.PrmTypeLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrmTypeLotRepository extends JpaRepository<PrmTypeLot, Long> {
}
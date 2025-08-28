package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.PrmTypePayMrc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrmTypePayMrcRepository extends JpaRepository<PrmTypePayMrc, Long> {
}
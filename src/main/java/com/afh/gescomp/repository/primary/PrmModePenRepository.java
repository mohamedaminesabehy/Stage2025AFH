package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.PrmModePen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrmModePenRepository extends JpaRepository<PrmModePen, Long> {
}
package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Avenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvenantRepository  extends JpaRepository<Avenant, Long> {
}

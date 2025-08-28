package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Banque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BanqueRepository extends JpaRepository<Banque, Short> {
    Banque findById(Short numBanque);
}

package com.afh.gescomp.repository.secondary;

import com.afh.gescomp.model.secondary.ERole;
import com.afh.gescomp.model.secondary.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository  extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(ERole name);
}

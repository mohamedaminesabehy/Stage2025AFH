/*
package com.afh.gescomp.repository.secondary;

import com.afh.gescomp.model.secondary.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository  extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByImmatricule(Long immatricule);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByImmatricule(Long immatricule);
}
*/

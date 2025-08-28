package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.numStruct.numStruct = '03'")
    List<User> findAdminUsers();
    @Query("SELECT u FROM User u WHERE u.numStruct.numStruct <> '03'")
    List<User> findSimpleUsers();
}
package com.afh.gescomp.service;

import com.afh.gescomp.model.secondary.ERole;
import com.afh.gescomp.model.secondary.Role;
import com.afh.gescomp.model.secondary.User;
import com.afh.gescomp.repository.secondary.RoleRepository;
import com.afh.gescomp.repository.secondary.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Transactional
    public void removeRoleFromUser(Long immatricule, ERole roleName) {
        // Trouver l'utilisateur par Immatricule
        User user = userRepository.findByImmatricule(immatricule)
                .orElseThrow(() -> new RuntimeException("User Immatricule not found"));

        // Trouver le rôle par nom
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Retirer le rôle de l'utilisateur
        user.getRoles().remove(role);

        // Sauvegarder les changements
        userRepository.save(user);
    }
    @Transactional
    public void addRoleToUser(Long immatricule, ERole roleName) {
        // Trouver l'utilisateur par Imatrricule
        User user = userRepository.findByImmatricule(immatricule)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Trouver le rôle par nom
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Ajouter le rôle à l'utilisateur
        user.getRoles().add(role);

        // Sauvegarder les changements
        userRepository.save(user);
    }
}

package com.afh.gescomp.controller;

import com.afh.gescomp.model.secondary.ERole;
import com.afh.gescomp.model.secondary.Role;
import com.afh.gescomp.repository.secondary.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping
    public ResponseEntity<List<String>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        List<String> roleNames = roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
        return ResponseEntity.ok(roleNames);
    }
}

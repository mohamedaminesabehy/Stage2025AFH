package com.afh.gescomp.controller;

import com.afh.gescomp.model.secondary.ERole;
import com.afh.gescomp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @DeleteMapping("/users/{immatricule}/roles/{roleName}")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable Long immatricule, @PathVariable ERole roleName) {
        userService.removeRoleFromUser(immatricule, roleName);
        return ResponseEntity.ok("Role removed from user");
    }

    @PostMapping("/users/{immatricule}/roles/{roleName}")
    public ResponseEntity<?> addRoleToUser(@PathVariable Long immatricule, @PathVariable ERole roleName) {
        userService.addRoleToUser(immatricule, roleName);
        return ResponseEntity.ok("Role added to user");
    }
}

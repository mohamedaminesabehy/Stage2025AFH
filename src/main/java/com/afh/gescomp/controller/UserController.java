package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Article;
import com.afh.gescomp.model.primary.User;
import com.afh.gescomp.repository.primary.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/UserAuth")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        User user = userRepository.findOne(id);
        if (user == null) {
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(user);
        }
    }

    @RequestMapping(value = "/admins", method = RequestMethod.GET)
    public ResponseEntity<List<User>> getAllAdmins() {
        List<User> admins = userRepository.findAdminUsers();
        return ResponseEntity.ok(admins);
    }

    @RequestMapping(value = "/users", method = RequestMethod.GET)
    public ResponseEntity<List<User>> getAllSimpleUsers() {
        List<User> admins = userRepository.findSimpleUsers();
        return ResponseEntity.ok(admins);
    }
}

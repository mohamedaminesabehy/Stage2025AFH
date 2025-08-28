package com.afh.gescomp.controller;

import com.afh.gescomp.dto.UserSignupDTO;
import com.afh.gescomp.model.primary.PrmStructure;
import com.afh.gescomp.model.primary.User;
import com.afh.gescomp.payload.request.PasswordHashRequest;
import com.afh.gescomp.payload.request.SignupRequest;
import com.afh.gescomp.payload.response.AuthenticationRequest;
import com.afh.gescomp.payload.response.AuthenticationResponse;
import com.afh.gescomp.repository.primary.PrmStructureRepository;
import com.afh.gescomp.service.JwtTokenService;
import com.afh.gescomp.service.PrmStructureService;
import com.afh.gescomp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
	private UserService userService;

	@Autowired
	private JwtTokenService jwtTokenService;


	@RequestMapping(value = "/login", method = RequestMethod.POST)
	public AuthenticationResponse authenticate(@RequestBody AuthenticationRequest authenticationRequest) {
		AuthenticationResponse authResponse = userService.authenticateUser(authenticationRequest.getMatricule(), authenticationRequest.getPassword());

		// Si l'authentification est réussie, générer un token JWT
		if (authResponse.isAuthenticated()) {
			String token = jwtTokenService.generateToken(authenticationRequest.getMatricule());
			authResponse.setJwtToken(token);
		}
		else  {
			authResponse.setJwtToken("absence du token. Veuillez vérifier votre authentification");
		}

		return authResponse;
	}

	@RequestMapping(value = "/signup", method = RequestMethod.POST)
	public ResponseEntity<Map<String, String>> signup(@RequestBody UserSignupDTO userSignupDTO) {
		String result = userService.createUser(userSignupDTO);
		Map<String, String> response = new HashMap<>();
		response.put("message", result);
		if ("Utilisateur créé avec succès".equals(result)) {
			return ResponseEntity.status(HttpStatus.CREATED).body(response);
		} else if ("Utilisateur avec ce Matricule existe déjà".equals(result)) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
		} else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
	}

}

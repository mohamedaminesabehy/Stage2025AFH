package com.afh.gescomp;

import com.afh.gescomp.model.secondary.ERole;
import com.afh.gescomp.model.secondary.Role;
import com.afh.gescomp.repository.secondary.RoleRepository;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;

import java.util.Base64;


@SpringBootApplication
public class GescompApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {

		SpringApplication.run(GescompApplication.class, args);
	}

	@Autowired
	private RoleRepository roleRepository;

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(GescompApplication.class);
	}

	@Bean
	public CommandLineRunner loadData() {
		return args -> {

			//var key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
			// Afficher la clé en base64
			//String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
			//System.out.println("Generated Key (Base64): " + base64Key);
			ERole[] roles = {ERole.ROLE_ADMIN, ERole.ROLE_USER, ERole.ROLE_MODERATOR};

			for (ERole roleName : roles) {
				// Check if the role already exists
				if (roleRepository.findByName(roleName).isEmpty()) {
					// Create and save the role if it does not exist
					Role role = new Role();
					role.setName(roleName);
					roleRepository.save(role);
				}
			}
		};


	}


}

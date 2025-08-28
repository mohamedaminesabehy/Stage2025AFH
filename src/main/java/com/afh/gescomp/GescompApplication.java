package com.afh.gescomp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.web.WebApplicationInitializer;

import java.util.TimeZone;


@SpringBootApplication
public class GescompApplication extends SpringBootServletInitializer implements WebApplicationInitializer{



	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		SpringApplication.run(GescompApplication.class, args);
	}
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(GescompApplication.class);
	}

	/*@Autowired
	private RoleRepository roleRepository;

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
				if (!roleRepository.findByName(roleName).isPresent()) {
					// Create and save the role if it does not exist
					Role role = new Role();
					role.setName(roleName);
					roleRepository.save(role);
				}
			}
		};


	}*/


}

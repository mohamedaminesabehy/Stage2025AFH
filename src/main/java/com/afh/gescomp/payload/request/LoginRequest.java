package com.afh.gescomp.payload.request;


import javax.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.NotBlank;

@Getter
@Setter
public class LoginRequest {

	@NotNull
	private Long immatricule;

	@NotBlank
	private String password;

}

package com.afh.gescomp.payload.request;


import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.afh.gescomp.model.primary.PrmStructure;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.NotBlank;

import java.util.Set;


@Getter
@Setter
public class SignupRequest {
    private Long matricule;
    private String nom;
    private String prenom;
    private PrmStructure prmStructure;
    private String password;

}

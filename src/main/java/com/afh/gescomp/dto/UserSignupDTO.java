package com.afh.gescomp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserSignupDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String numStruct;  // Reçu comme chaîne de caractères
    private String passwordHash;
    private String passwordClair;
    private Integer idPoste;
}

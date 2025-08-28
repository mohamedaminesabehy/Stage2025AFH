package com.afh.gescomp.payload.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {
    private boolean authenticated;
    private String resultat;
    private String numStruct;
    private String designation;
    private String jwtToken;
}

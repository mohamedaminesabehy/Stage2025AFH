
package com.afh.gescomp.service;

import com.afh.gescomp.dto.UserSignupDTO;
import com.afh.gescomp.payload.response.AuthenticationResponse;

public interface UserService {
    AuthenticationResponse authenticateUser(Long matricule, String password);
    String hashPassword(String password);
    String createUser(UserSignupDTO userSignupDTO);
}


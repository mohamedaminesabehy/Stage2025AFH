package com.afh.gescomp.implementation;

import com.afh.gescomp.dto.UserSignupDTO;
import com.afh.gescomp.model.primary.PrmStructure;
import com.afh.gescomp.model.primary.User;
import com.afh.gescomp.payload.response.AuthenticationResponse;
import com.afh.gescomp.repository.primary.PrmStructureRepository;
import com.afh.gescomp.repository.primary.UserRepository;
import com.afh.gescomp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Connection;
import java.sql.CallableStatement;
import java.sql.SQLException;
import java.sql.Types;
import javax.sql.DataSource;



@Service
public class UserServiceImpl implements  UserService {


    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PrmStructureRepository prmStructureRepository;

    @Transactional
    @Override
    public AuthenticationResponse authenticateUser(Long matricule, String password) {
        AuthenticationResponse authResponse = new AuthenticationResponse();

        try (Connection connection = dataSource.getConnection();
             CallableStatement callableStatement = connection.prepareCall("{ ? = call PKG_AUTH.AUTHENTIFICATE_USER_STRUCT(?, ?, ?, ?, ?) }")) {
            callableStatement.registerOutParameter(1, Types.VARCHAR);
            callableStatement.setLong(2, matricule);
            callableStatement.setString(3, password);
            callableStatement.registerOutParameter(4, Types.INTEGER);
            callableStatement.registerOutParameter(5, Types.VARCHAR);
            callableStatement.registerOutParameter(6, Types.VARCHAR);
            callableStatement.execute();
            String resultMessage = callableStatement.getString(1);
            int isAuthenticatedInt = callableStatement.getInt(4);
            boolean isAuthenticated = isAuthenticatedInt == 1;
            String numStruct = callableStatement.getString(5);
            String designation = callableStatement.getString(6);
            authResponse.setAuthenticated(isAuthenticated);
            authResponse.setResultat(resultMessage);
            authResponse.setNumStruct(numStruct);
            authResponse.setDesignation(designation);

        } catch (SQLException e) {
            e.printStackTrace();
            authResponse.setResultat("Une erreur est survenue");
            authResponse.setAuthenticated(false);
        }

        return authResponse;
    }

    @Transactional
    @Override
    public String hashPassword(String password) {
        String hashedPassword = null;
        try (Connection connection = dataSource.getConnection();
             CallableStatement callableStatement = connection.prepareCall("{ ? = call PKG_AUTH.hash_string(?) }")) {
            callableStatement.registerOutParameter(1, Types.VARCHAR);
            callableStatement.setString(2, password); // Passer le mot de passe à la fonction
            callableStatement.execute();
            hashedPassword = callableStatement.getString(1);
        } catch (SQLException e) {
            e.printStackTrace();
            hashedPassword = null;
        }
        return hashedPassword;
    }

    @Transactional
    @Override
    public String createUser(UserSignupDTO userSignupDTO) {
        PrmStructure prmStructure = prmStructureRepository.findPrmStructureByNumStruct(userSignupDTO.getNumStruct());
        if (prmStructure == null) {
            return "Structure introuvable";
        }
        User existingUser = userRepository.findOne(userSignupDTO.getId());
        if (existingUser != null) {
            return "Utilisateur avec ce Matricule existe déjà";
        }
        String hashedPassword = hashPassword(userSignupDTO.getPasswordHash());
        User user = new User();
        user.setId(userSignupDTO.getId());
        user.setNom(userSignupDTO.getNom());
        user.setPrenom(userSignupDTO.getPrenom());
        user.setNumStruct(prmStructure);
        user.setPasswordHash(hashedPassword);
        user.setPasswordClair(userSignupDTO.getPasswordClair());
        user.setIdPoste(userSignupDTO.getIdPoste());
        userRepository.save(user);
        return "Utilisateur créé avec succès";
    }

}

package com.afh.gescomp.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtTokenService {

    private final String secretKey = "KaisserFrigui";  // Changez cette clé par une plus sécurisée

    // Générer un token JWT
    public String generateToken(Long matricule) {
        return Jwts.builder()
                .setSubject(String.valueOf(matricule))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // Expiration dans 1 jour
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    // Extraire le matricule du token JWT
    public Long extractMatricule(String token) {
        return Long.parseLong(Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject());
    }

    // Vérifier si le token est valide
    public boolean isTokenValid(String token, Long matricule) {
        return matricule.equals(extractMatricule(token)) && !isTokenExpired(token);
    }

    // Vérifier si le token est expiré
    public boolean isTokenExpired(String token) {
        return extractExpirationDate(token).before(new Date());
    }

    private Date extractExpirationDate(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }
}

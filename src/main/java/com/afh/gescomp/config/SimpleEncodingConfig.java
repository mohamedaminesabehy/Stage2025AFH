package com.afh.gescomp.config;

import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Configuration simple pour forcer l'encodage UTF-8
 * Compatible avec Spring Boot 1.3.8
 * Résout les problèmes d'affichage des caractères arabes
 */
@Configuration
public class SimpleEncodingConfig {

    /**
     * Filtre personnalisé pour forcer l'encodage UTF-8
     * Compatible avec Spring Boot 1.3.8
     */
    public static class UTF8EncodingFilter extends OncePerRequestFilter {
        
        @Override
        protected void doFilterInternal(HttpServletRequest request, 
                                     HttpServletResponse response, 
                                     FilterChain filterChain) 
                throws ServletException, IOException {
            
            // Forcer l'encodage UTF-8 sur la requête
            if (request.getCharacterEncoding() == null) {
                request.setCharacterEncoding("UTF-8");
            }
            
            // Forcer l'encodage UTF-8 sur la réponse
            response.setCharacterEncoding("UTF-8");
            response.setContentType("text/html; charset=UTF-8");
            
            // Ajouter les headers d'encodage
            response.setHeader("Content-Type", "text/html; charset=UTF-8");
            response.setHeader("Accept-Charset", "UTF-8");
            
            // Continuer la chaîne de filtres
            filterChain.doFilter(request, response);
        }
    }
    
    /**
     * Enregistrement du filtre d'encodage UTF-8
     * @return Bean de configuration du filtre
     */
    @Bean
    public FilterRegistrationBean utf8EncodingFilter() {
        FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        
        UTF8EncodingFilter utf8Filter = new UTF8EncodingFilter();
        registrationBean.setFilter(utf8Filter);
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(1);
        registrationBean.setName("utf8EncodingFilter");
        
        return registrationBean;
    }
    
    // La configuration des propriétés système est maintenant gérée par UTF8EncodingInitializer
    // avec @PostConstruct pour éviter les problèmes de compatibilité Spring Boot 1.3.8
} 
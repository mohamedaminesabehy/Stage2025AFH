
package com.afh.gescomp.security;

//import com.afh.gescomp.security.jwt.AuthEntryPointJwt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;


@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)  // Enable method-level security if needed
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    //private  AuthEntryPointJwt unauthorizedHandler;

    // Constructeur par défaut sans paramètre
    public WebSecurityConfig() {}

    // Injection du handler via setter
   /* @Autowired
    public void setUnauthorizedHandler(AuthEntryPointJwt unauthorizedHandler) {
        this.unauthorizedHandler = unauthorizedHandler;
    }*/

    // AuthenticationManager bean to manage authentication
    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    // Password encoder bean (BCrypt) for password hashing
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Define custom userDetailsService if needed (example)
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService()).passwordEncoder(passwordEncoder());
    }

   // Define the HTTP security configuration

/*@Override
   protected void configure(HttpSecurity http) throws Exception {
       http.csrf().disable()
               .authorizeRequests()
               .antMatchers("/**").permitAll()
               .and()
               .exceptionHandling()
               .authenticationEntryPoint(unauthorizedHandler)  // Handle authentication failures
               .and()
               .sessionManagement()
               .sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // Stateless authentication (e.g., JWT)
               .and()
               .httpBasic().disable()  // Disable HTTP Basic Authentication if you're using JWT
               .formLogin().disable();  // Disable form login if you're using JWT

       // If you are using JWT, uncomment the following to add the JWT filter
       // http.addFilterBefore(new AuthTokenFilter(), UsernamePasswordAuthenticationFilter.class);
   }*/


@Override
protected void configure(HttpSecurity http) throws Exception {
    http.csrf().disable()
            .authorizeRequests()
            .antMatchers("/**").permitAll()
            .antMatchers("/api/resources/**").permitAll()
            .antMatchers("/static/**", "/index.html").permitAll()  // Permet l'accès aux ressources statiques
            .anyRequest().permitAll();
}

}


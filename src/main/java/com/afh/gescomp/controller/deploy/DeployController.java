package com.afh.gescomp.controller.deploy;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class DeployController {

    @RequestMapping(value = { "/home", "/dashboard", "/stat", "/marche","/fournisseur","/typegarantie","/typepenalite","/article", "/decompte", "/marche/**","/decompte/**","/profile","/profile/**","/chat" })
    public String index() {
        return "forward:/static/index.html";  // Redirection vers index.html pour la racine
    }
}

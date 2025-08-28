package com.afh.gescomp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

@Component
public class TimeZoneConfig {
    @Value("${app.timezone:America/Asuncion}")  // Valeur par défaut
    private String timeZone;

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
        System.out.println("Default time zone set to: " + TimeZone.getDefault().getID());
    }
}

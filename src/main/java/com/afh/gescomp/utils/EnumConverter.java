package com.afh.gescomp.utils;

import com.afh.gescomp.model.secondary.ERole;
import org.springframework.stereotype.Component;
import org.springframework.core.convert.converter.Converter;

@Component
public class EnumConverter  implements Converter<String, ERole> {
    @Override
    public ERole convert(String source) {
        try {
            return ERole.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + source);
        }
    }
}

package com.afh.gescomp.config;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.sql.Date;

@Converter(autoApply = true)
public class LocalDateConverter implements AttributeConverter<Date, Date> {

    @Override
    public Date convertToDatabaseColumn(Date attribute) {
        return (attribute == null ? null : attribute);
    }

    @Override
    public Date convertToEntityAttribute(Date dbData) {
        return (dbData == null ? null : dbData);
    }
}

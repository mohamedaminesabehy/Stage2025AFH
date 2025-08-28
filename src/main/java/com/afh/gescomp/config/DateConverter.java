package com.afh.gescomp.config;

import javax.persistence.AttributeConverter;
import java.sql.Date;
import java.sql.Timestamp;

public class DateConverter implements AttributeConverter<Date, Timestamp> {

    @Override
    public Timestamp convertToDatabaseColumn(Date date) {
        return (date == null ? null : new Timestamp(date.getTime()));
    }

    @Override
    public Date convertToEntityAttribute(Timestamp timestamp) {
        return (timestamp == null ? null : new Date(timestamp.getTime()));
    }
}

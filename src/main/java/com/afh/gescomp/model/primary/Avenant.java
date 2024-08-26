package com.afh.gescomp.model.primary;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * les avenants
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "AVENANT", indexes = {
        @Index(name = "FK_AV_MARCHE_FK", columnList = "NUM_MARCHE")
})
public class Avenant implements Serializable {
    private static final long serialVersionUID = 4011017082566556826L;
    private AvenantId id;



    /**
     * date de l'avenant
     */
    private LocalDate dateAvenant;

    private LocalDate dateConAdmin;

    private LocalDate dateNotif;

    private LocalDate dateEnreg;

    private LocalDate dateCsm;

    private LocalDate dateCm;

    @EmbeddedId
    public AvenantId getId() {
        return id;
    }

    @NotNull
    @Column(name = "DATE_AVENANT", nullable = false)
    public LocalDate getDateAvenant() {
        return dateAvenant;
    }

    @Column(name = "DATE_CON_ADMIN")
    public LocalDate getDateConAdmin() {
        return dateConAdmin;
    }

    @Column(name = "DATE_NOTIF")
    public LocalDate getDateNotif() {
        return dateNotif;
    }

    @Column(name = "DATE_ENREG")
    public LocalDate getDateEnreg() {
        return dateEnreg;
    }

    @Column(name = "DATE_CSM")
    public LocalDate getDateCsm() {
        return dateCsm;
    }

    @Column(name = "DATE_CM")
    public LocalDate getDateCm() {
        return dateCm;
    }

}
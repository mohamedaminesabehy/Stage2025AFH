package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

/**
 * Liste des banques
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "Banque")
@Table(name = "BANQUE", schema = "ACHAT")
public class Banque implements Serializable {
    private static final long serialVersionUID = 8310258165781518259L;
    private Short id;

    private String designation;

    @Id
    @Column(name = "NUM_BANQUE", nullable = false)
    public Short getId() {
        return id;
    }

    @Size(max = 120)
    @NotNull
    @Column(name = "DESIGNATION", nullable = false, length = 120)
    public String getDesignation() {
        return designation;
    }

}
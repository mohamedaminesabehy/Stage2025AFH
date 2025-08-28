package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "PrmTypeOrdreService")
@Table(name = "PRM_TYPE_ORDRE_SERVICE", schema = "ACHAT")
public class PrmTypeOrdreService implements Serializable {
    private static final long serialVersionUID = 4207299856513707751L;
    private Long id;

    private String designation;

    @Id
    @Column(name = "ID_TYPE_ORDRE_SERVISE", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @NotNull
    @Column(name = "DESIGNATION", nullable = false, length = 100)
    public String getDesignation() {
        return designation;
    }

}
package com.afh.gescomp.model.primary;


import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "PrmModePen")
@Table(name = "PRM_MODE_PEN", schema = "ACHAT")
public class PrmModePen implements Serializable {
    private static final long serialVersionUID = 8306972774732292327L;
    private Long idModePen;

    private String designation;

    @Id
    @NotNull
    @Column(name = "ID_MODE_PEN", nullable = false)
    public Long getIdModePen() {
        return idModePen;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

}
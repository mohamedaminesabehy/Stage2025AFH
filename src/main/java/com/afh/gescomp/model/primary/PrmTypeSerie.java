package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "PrmTypeSerie")
@Table(name = "PRM_TYPE_SERIE", schema = "ACHAT")
public class PrmTypeSerie implements Serializable {
    private static final long serialVersionUID = 7851761619622483276L;
    private Long id;

    private String designation;

    @Id
    @Column(name = "ID_TYPE_SERIE", nullable = false)
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
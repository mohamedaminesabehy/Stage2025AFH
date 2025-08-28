package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "PRM_TYPE_PENALITE", schema = "ACHAT")
public class TypePenalite implements Serializable {
    private static final long serialVersionUID = -172118930156524121L;
    private Long id;

    private String designation;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "TYPE_PENALITE_id_gen")
    @SequenceGenerator(name = "TYPE_PENALITE_id_gen", sequenceName = "TYPE_PENALITE_SEQ", allocationSize = 1)
    @Column(name = "ID_TYPE_PEN", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

}
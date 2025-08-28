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
@Entity(name = "PrmTypeNant")
@Table(name = "PRM_TYPE_NANT", schema = "ACHAT")
public class PrmTypeNant implements Serializable {
    private static final long serialVersionUID = -7710833367413354310L;
    private Long id;

    private String designation;

    @Id
    @Column(name = "NANT", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

}
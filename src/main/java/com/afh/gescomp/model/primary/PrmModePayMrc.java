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
@Entity(name = "PrmModePayMrc")
@Table(name = "PRM_MODE_PAY_MRC", schema = "ACHAT")
public class PrmModePayMrc implements Serializable {
    private static final long serialVersionUID = -3978505718615388520L;
    private Long id;

    private String designation;

    @Id
    @Column(name = "ID_MODE_PAY_MRC", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

}
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
@Entity(name = "PrmTypeValue")
@Table(name = "PRM_TYPE_VALUE", schema = "ACHAT")
public class PrmTypeValue implements Serializable {
    private static final long serialVersionUID = -8025429157762408147L;
    private Long id;

    private String designation;

    @Id
    @Column(name = "ID_TYPE_VALUE", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

}
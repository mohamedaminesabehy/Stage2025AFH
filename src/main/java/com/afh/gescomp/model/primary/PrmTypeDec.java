package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "PrmTypeDec")
@Table(name = "PRM_TYPE_DEC", schema = "ACHAT")
public class PrmTypeDec implements Serializable {
    private static final long serialVersionUID = -1175266073940033235L;
    private Long id;

    private String designation;

    @Id
    @Column(name = "ID_TYPE_DEC", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

}
package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

/**
 * les natures des garanties
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
@Table(name = "PRM_TYPE_GARANTIE", schema = "ACHAT")
public class TypeGarantie implements Serializable {
    private static final long serialVersionUID = 2182770308025474833L;
    private Long id;

    private String designation;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "TYPE_GARANTIE_id_gen")
    @SequenceGenerator(name = "TYPE_GARANTIE_id_gen", sequenceName = "TYPE_GARANTIE_SEQ", allocationSize = 1)
    @Column(name = "ID_TYPE_GARANTIE", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 60)
    @NotNull
    @Column(name = "DESIGNATION", nullable = false, length = 60)
    public String getDesignation() {
        return designation;
    }

}
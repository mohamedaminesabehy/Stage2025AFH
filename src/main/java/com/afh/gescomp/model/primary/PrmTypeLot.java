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
@Entity(name = "PrmTypeLot")
@Table(name = "PRM_TYPE_LOT", schema = "ACHAT")
public class PrmTypeLot implements Serializable {
    private static final long serialVersionUID = 5658242375523014281L;
    private Long id;

    private String designation;

    @Id
    @Column(name = "ID_TYPE_LOT", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

}
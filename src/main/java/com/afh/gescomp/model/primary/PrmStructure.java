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
@Entity(name = "PrmStructure")
@Table(name = "PRM_STRUCTURE", schema = "ACHAT")
public class PrmStructure implements Serializable {
    private static final long serialVersionUID = 8162172493144439728L;
    private String numStruct;

    private String designation;

    private String numStructPar;

    private String finStrcCod;

    @Id
    @Size(max = 22)
    @Column(name = "NUM_STRUCT", nullable = false, length = 22)
    public String getNumStruct() {
        return numStruct;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

    @Size(max = 20)
    @Column(name = "NUM_STRUCT_PAR", length = 20)
    public String getNumStructPar() {
        return numStructPar;
    }

    @Size(max = 20)
    @Column(name = "FIN_STRC_COD", length = 20)
    public String getFinStrcCod() {
        return finStrcCod;
    }

}
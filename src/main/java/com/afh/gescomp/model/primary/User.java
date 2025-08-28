package com.afh.gescomp.model.primary;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "User")
@Table(name = "USERS", schema = "ACHAT")
public class User implements Serializable {
    private static final long serialVersionUID = 436163770136024696L;
    /**
     * user
     */
    private Long id;

    private String nom;

    private String prenom;

    private PrmStructure numStruct;

    private Integer idPoste;

    private String passwordHash;

    private String passwordClair;


    @Id
    @Column(name = "MATRICULE", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "NOM", length = 100)
    public String getNom() {
        return nom;
    }

    @Size(max = 100)
    @Column(name = "PRENOM", length = 100)
    public String getPrenom() {
        return prenom;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "NUM_STRUCT")
    @JsonProperty("NUM_STRUCT")
    public PrmStructure getNumStruct() {
        return numStruct;
    }

    @Size(max = 100)
    @Column(name = "PWD_HASH", length = 100)
    public String getPasswordHash() { return passwordHash; }

    @Size(max = 100)
    @Column(name = "PWD_CLAIR", length = 100)
    public String getPasswordClair() { return passwordClair; }

    @Column(name = "ID_POSTE")
    public Integer getIdPoste() { return idPoste; }

}
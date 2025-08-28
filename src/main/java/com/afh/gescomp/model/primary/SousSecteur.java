package com.afh.gescomp.model.primary;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity(name = "SOUS_SECTEUR" )
@Table(name = "SOUS_SECTEUR", schema = "ACHAT")
@IdClass(SousSecteurId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SousSecteur {

    @Id
    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;

    @Id
    @Column(name = "NUM_S_SECT_ECO")
    private Short numSSectEco;

    @Column(name = "DESIGNATION")
    private String designation;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "NUM_SECT_ECO", insertable = false, updatable = false)
    private Secteur secteur;

    @JsonManagedReference
    @OneToMany(mappedBy = "sousSecteur")
    private Set<Famille> familles;


}

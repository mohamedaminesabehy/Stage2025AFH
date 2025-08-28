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

@Entity(name = "Famille")
@Table(name = "FAMILLE", schema = "ACHAT")
@IdClass(FamilleId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Famille {

    @Id
    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;

    @Id
    @Column(name = "NUM_S_SECT_ECO")
    private Short numSSectEco;

    @Id
    @Column(name = "NUM_FAMILLE")
    private Short numFamille;

    @Column(name = "DESIGNATION")
    private String designation;

    @Column(name = "DESC_FAM")
    private  String descFam;

    @Column(name = "NUM_CPT")
    private Integer numCpt;

    @Column(name = "DESIGNATION_FR")
    private String designationFr;

    @JsonBackReference
    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "NUM_SECT_ECO", referencedColumnName = "NUM_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_S_SECT_ECO", referencedColumnName = "NUM_S_SECT_ECO", insertable = false, updatable = false)
    })
    private SousSecteur sousSecteur;

    @JsonManagedReference
    @OneToMany(mappedBy = "famille")
    private Set<SousFamille> sousFamilles;
}

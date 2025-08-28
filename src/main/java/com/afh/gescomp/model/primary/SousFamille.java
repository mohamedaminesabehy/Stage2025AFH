package com.afh.gescomp.model.primary;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity(name = "SOUS_FAMILLE")
@Table(name = "SOUS_FAMILLE", schema = "ACHAT")
@IdClass(SousFamilleId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SousFamille {

    @Id
    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;

    @Id
    @Column(name = "NUM_S_SECT_ECO")
    private Short numSSectEco;

    @Id
    @Column(name = "NUM_FAMILLE")
    private Short numFamille;

    @Id
    @Column(name = "NUM_S_FAMILLE")
    private Short numSFamille;

    @Column(name = "DESIGNATION")
    private String designation;

    @JsonBackReference
    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "NUM_SECT_ECO", referencedColumnName = "NUM_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_S_SECT_ECO", referencedColumnName = "NUM_S_SECT_ECO", insertable = false, updatable = false),
            @JoinColumn(name = "NUM_FAMILLE", referencedColumnName = "NUM_FAMILLE", insertable = false, updatable = false)
    })
    private Famille famille;
}

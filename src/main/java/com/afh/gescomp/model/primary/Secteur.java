package com.afh.gescomp.model.primary;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity(name = "SECT_ECO")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "SECT_ECO",schema = "ACHAT")
public class Secteur {

    @Id
    @Column(name = "NUM_SECT_ECO")
    private Short numSectEco;

    @Column(name = "DESIGNATION")
    private String designation;

    @JsonIgnore
    @OneToMany(mappedBy = "secteur")
    private Set<SousSecteur> sousSecteurs;

}

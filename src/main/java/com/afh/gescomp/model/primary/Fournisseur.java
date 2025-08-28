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
@Entity
@Table(name = "FOURNISSEUR", schema = "ACHAT")
public class Fournisseur implements Serializable {
    private static final long serialVersionUID = 4013440483964515402L;
    private Long id;

    private String numFourn;

    private String codePays;

    private String numGouv;

    private String designation;

    private String contact;

    private String adresse;

    private String ville;

    private String codePostal;

    private String tel;

    private String fax;

    private String email;

    private String web;

    private String structCap;

    private String activite;

    private String rcs;

    private String matCnss;

    private String designationFr;

    private String matriculeFisc;

    private String finFourn;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "FOURNISSEUR_id_gen")
    @SequenceGenerator(name = "FOURNISSEUR_id_gen", sequenceName = "FOURNISSEUR_SEQ", allocationSize = 1)
    @Column(name = "ID_FOURN", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 100)
    @Column(name = "NUM_FOURN", length = 100)
    public String getNumFourn() {
        return numFourn;
    }

    @Size(max = 100)
    @Column(name = "CODE_PAYS", length = 100)
    public String getCodePays() {
        return codePays;
    }

    @Size(max = 100)
    @Column(name = "NUM_GOUV", length = 100)
    public String getNumGouv() {
        return numGouv;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

    @Size(max = 100)
    @Column(name = "CONTACT", length = 100)
    public String getContact() {
        return contact;
    }

    @Size(max = 100)
    @Column(name = "ADRESSE", length = 100)
    public String getAdresse() {
        return adresse;
    }

    @Size(max = 100)
    @Column(name = "VILLE", length = 100)
    public String getVille() {
        return ville;
    }

    @Size(max = 100)
    @Column(name = "CODE_POSTAL", length = 100)
    public String getCodePostal() {
        return codePostal;
    }

    @Size(max = 100)
    @Column(name = "TEL", length = 100)
    public String getTel() {
        return tel;
    }

    @Size(max = 100)
    @Column(name = "FAX", length = 100)
    public String getFax() {
        return fax;
    }

    @Size(max = 100)
    @Column(name = "EMAIL", length = 100)
    public String getEmail() {
        return email;
    }

    @Size(max = 100)
    @Column(name = "WEB", length = 100)
    public String getWeb() {
        return web;
    }

    @Size(max = 100)
    @Column(name = "STRUCT_CAP", length = 100)
    public String getStructCap() {
        return structCap;
    }

    @Size(max = 100)
    @Column(name = "ACTIVITE", length = 100)
    public String getActivite() {
        return activite;
    }

    @Size(max = 100)
    @Column(name = "RCS", length = 100)
    public String getRcs() {
        return rcs;
    }

    @Size(max = 100)
    @Column(name = "MAT_CNSS", length = 100)
    public String getMatCnss() {
        return matCnss;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION_FR", length = 100)
    public String getDesignationFr() {
        return designationFr;
    }

    @Size(max = 100)
    @Column(name = "MATRICULE_FISC", length = 100)
    public String getMatriculeFisc() {
        return matriculeFisc;
    }

    @Size(max = 100)
    @Column(name = "FIN_FOURN", length = 100)
    public String getFinFourn() {
        return finFourn;
    }

}
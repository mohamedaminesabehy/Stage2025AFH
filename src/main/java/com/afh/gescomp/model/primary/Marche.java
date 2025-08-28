package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import org.hibernate.annotations.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Les marches
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "Marche")
@Table(name = "MARCHE", schema = "ACHAT")
public class Marche implements Serializable {
    private static final long serialVersionUID = 7346491572558042193L;
    /**
     * identifiant du marche
     */
    private Long id;

    private Banque numBanque;

    /**
     * identifiant du ministere
     */
    private String numMin;

    /**
     * STRUCTURE
     */
    private PrmStructure idStructure;

    /**
     * identifiant de l'avant marche
     */
    private String numAvMarche;

    /**
     * Matricule Fiscale
     */
    private String numFourn;

    /**
     * identifiant du personnel
     */
    private String iu;

    /**
     * objet du marche fr
     */
    private String designation;

    /**
     * taux de retenue a la tva
     */
    private Short pctRetTva;

    /**
     * Taux de retenue a la source
     */
    private BigDecimal pctRetIr;

    /**
     * Taux max de penalite
     */
    private Short pctMaxPenalite;

    /**
     * Date de notification du marche
     */
    private Date dateMarche;

    /**
     * date de resiliation du marche
     */
    private Date dateResiliation;

    /**
     * date de cloture definitive du marche
     */
    private Date dateCloture;

    /**
     * rib du fournisseur
     */
    private String rib;

    /**
     * % retenue de grarantie
     */
    private Short pctRetGar;

    /**
     * % Avance sur les payements
     */
    private Short pctAvancePay;

    /**
     * Duree contractuelle
     */
    private Long dureeContract;

    /**
     * 1:Facture, 2:Decompte
     */
    private PrmTypePayMrc typePFMarche;

    /**
     * taux de variation dans la masse
     */
    private BigDecimal pctVdm;

    /**
     * taux max de variation dans la masse
     */
    private BigDecimal pctMaxVdm;

    /**
     * Date de presentation du marche a la commission interne des marches
     */
    private Date dateCm;

    /**
     * Date de prensentation du marche a la conseil d'administration
     */
    private Date dateConAdmin;

    /**
     * Date de notification
     */
    private Date dateNotif;

    /**
     * Date d'enregistrement
     */
    private Date dateEnreg;

    /**
     * Date de retour de la caution provisoire au soumissionaire
     */
    private Date dateRetCp;

    /**
     * l'exercice comptable
     */
    private Short exercice;

    /**
     * Taux de TVA a appliquer au niveau decompte
     */
    private Short pctTva;

    /**
     * Date de presentation du marche a la commission superieure des marches
     */
    private Date dateCsm;

    /**
     * 1 Marche nanti 0 marche non nanti
     */
    private PrmTypeNant nant;

    private Short numLot;

    /**
     * Taux de penalite par jour de retard
     */
    private BigDecimal tauxPenJ;

    /**
     * Montant de penalite par jour de retard
     */
    private BigDecimal montantPenJ;

    /**
     * Taux de retenue de garantie sur l'approvisionnement
     */
    private Short pctRetApp;

    /**
     * Pourcentage FODEC
     */
    private Short pctFodec;


    /**
     * Observation des reglements definitifs
     */
    private String obserRegDef;

    /**
     * PAIEMENT PAR PHASE OU PAR BORDEREAU
     */
    private PrmModePayMrc modePai;

    /**
     * 1 : plus value ; 0 : moins value
     */
    private PrmTypeValue plusMoinsValue;

    /**
     * objet du marche ar
     */
    private String designationFr;

    private String numStructOld;

    private Date dateDebFluct;


    private Date dateSoum;

    private Date dateSusp;

    private Fournisseur idFourn;

    private BigDecimal pctRemise;

    /**
     * MNT TOTALE MARCHE
     */
    private BigDecimal mntMarche;

    private Long pctRetAv;

    /**
     * DATE DE VALEUR ZERO POUR L'INDICE
     */
    private Date dateZero;

    private Short exPen;

    private PrmModePen idModePen;

    private BigDecimal mntMrcApresAvenant;

    private BigDecimal dureeAvance;


    @Id
    @Column(name = "NUM_MARCHE", nullable = false)
    public Long getId() {
        return id;
    }

    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "ID_MODE_PEN", nullable = true)
    public PrmModePen getIdModePen() {
        return idModePen;
    }

    @Column(name = "EX_PEN")
    public Short getExPen(){return  exPen; }

    @Size(max = 2)
    @NotNull
    @Column(name = "NUM_MIN", nullable = false, length = 2)
    public String getNumMin() {
        return numMin;
    }

    @NotNull
    @NotFound(action = NotFoundAction.IGNORE)
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "NUM_STRUCT", nullable = false)
    public PrmStructure getIdStructure() {
        return idStructure;
    }

    @Size(max = 13)
    @Column(name = "NUM_AV_MARCHE", length = 13)
    public String getNumAvMarche() {
        return numAvMarche;
    }

    @Size(max = 100)
    @Column(name = "NUM_FOURN", length = 100)
    public String getNumFourn() {
        return numFourn;
    }

    @Size(max = 10)
    @Column(name = "IU", length = 10)
    public String getIu() {
        return iu;
    }

    @Size(max = 2000)
    @NotNull
    @Column(name = "DESIGNATION", nullable = false, length = 2000)
    public String getDesignation() {
        return designation;
    }

    @ColumnDefault("50")
    @Column(name = "PCT_RET_TVA")
    public Short getPctRetTva() {
        return pctRetTva;
    }

    @ColumnDefault("5")
    @Column(name = "PCT_RET_IR", precision = 4, scale = 2)
    public BigDecimal getPctRetIr() {
        return pctRetIr;
    }

    @ColumnDefault("10")
    @Column(name = "PCT_MAX_PENALITE")
    public Short getPctMaxPenalite() {
        return pctMaxPenalite;
    }

    @Column(name = "DATE_MARCHE")
    public Date getDateMarche() {
        return dateMarche;
    }

    @Column(name = "DATE_RESILIATION")
    public Date getDateResiliation() {
        return dateResiliation;
    }

    @Column(name = "DATE_CLOTURE")
    public Date getDateCloture() {
        return dateCloture;
    }

    @Size(max = 20)
    @Column(name = "RIB", length = 20)
    public String getRib() {
        return rib;
    }

    @ColumnDefault("10")
    @Column(name = "PCT_RET_GAR")
    public Short getPctRetGar() {
        return pctRetGar;
    }

    @ColumnDefault("10")
    @Column(name = "PCT_AVANCE_PAY")
    public Short getPctAvancePay() {
        return pctAvancePay;
    }

    @Column(name = "DUREE_CONTRACT")
    public Long getDureeContract() {
        return dureeContract;
    }

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @ColumnDefault("2")
    @JoinColumn(name = "TYPE_P_F_MARCHE", nullable = false)
    public PrmTypePayMrc getTypePFMarche() {
        return typePFMarche;
    }

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "NUM_BANQUE", nullable = false)
    public Banque getNumBanque() {
        return numBanque;
    }

    @Column(name = "PCT_VDM", precision = 4, scale = 2)
    public BigDecimal getPctVdm() {
        return pctVdm;
    }

    @Column(name = "PCT_MAX_VDM", precision = 4, scale = 2)
    public BigDecimal getPctMaxVdm() {
        return pctMaxVdm;
    }

    @Column(name = "DATE_CM")
    public Date getDateCm() {
        return dateCm;
    }

    @NotNull
    @Column(name = "DATE_CON_ADMIN", nullable = false)
    public Date getDateConAdmin() {
        return dateConAdmin;
    }

    @NotNull
    @Column(name = "DATE_NOTIF", nullable = false)
    public Date getDateNotif() {
        return dateNotif;
    }

    @NotNull
    @Column(name = "DATE_ENREG", nullable = false)
    public Date getDateEnreg() {
        return dateEnreg;
    }

    @Column(name = "DATE_RET_CP")
    public Date getDateRetCp() {
        return dateRetCp;
    }

    @NotNull
    @Column(name = "EXERCICE", nullable = false)
    public Short getExercice() {
        return exercice;
    }

    @Column(name = "PCT_TVA")
    public Short getPctTva() {
        return pctTva;
    }

    @Column(name = "DATE_CSM")
    public Date getDateCsm() {
        return dateCsm;
    }


    @ManyToOne(fetch = FetchType.EAGER)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "NANT")
    public PrmTypeNant getNant() {
        return nant;
    }

    @Column(name = "NUM_LOT")
    public Short getNumLot() {
        return numLot;
    }

    @Column(name = "TAUX_PEN_J", precision = 10, scale = 5)
    public BigDecimal getTauxPenJ() {
        return tauxPenJ;
    }

    @Column(name = "MONTANT_PEN_J", precision = 12, scale = 3)
    public BigDecimal getMontantPenJ() {
        return montantPenJ;
    }

    @Column(name = "PCT_RET_APP")
    public Short getPctRetApp() {
        return pctRetApp;
    }

    @Column(name = "PCT_FODEC")
    public Short getPctFodec() {
        return pctFodec;
    }

    @Size(max = 2000)
    @Column(name = "OBSER_REG_DEF", length = 2000)
    public String getObserRegDef() {
        return obserRegDef;
    }


    @ManyToOne(fetch = FetchType.EAGER)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @ColumnDefault("0")
    @JoinColumn(name = "MODE_PAI")
    public PrmModePayMrc getModePai() {
        return modePai;
    }


    @ManyToOne(fetch = FetchType.EAGER)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @ColumnDefault("1")
    @JoinColumn(name = "PLUS_MOINS_VALUE")
    public PrmTypeValue getPlusMoinsValue() {
        return plusMoinsValue;
    }

    @Size(max = 2000)
    @Column(name = "DESIGNATION_FR", length = 2000)
    public String getDesignationFr() {
        return designationFr;
    }

    @Size(max = 6)
    @Column(name = "NUM_STRUCT_OLD", length = 6)
    public String getNumStructOld() {
        return numStructOld;
    }

    @Column(name = "DATE_DEB_FLUCT")
    public Date getDateDebFluct() {
        return dateDebFluct;
    }

    @Column(name = "DATE_SOUM")
    public Date getDateSoum() {
        return dateSoum;
    }

    @Column(name = "DATE_SUSP")
    public Date getDateSusp() {
        return dateSusp;
    }


    @ManyToOne(fetch = FetchType.EAGER)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "ID_FOURN")
    public Fournisseur getIdFourn() {
        return idFourn;
    }

    @Column(name = "PCT_REMISE" , precision = 4, scale = 2)
    public BigDecimal getPctRemise() {
        return pctRemise;
    }

    @Column(name = "MNT_MARCHE", precision = 38, scale = 5)
    public BigDecimal getMntMarche() {
        return mntMarche;
    }

    @Column(name = "PCT_RET_AV")
    public Long getPctRetAv() {
        return pctRetAv;
    }

    @Column(name = "DATE_ZERO")
    public Date getDateZero() {
        return dateZero;
    }

    @Column(name = "MNT_MRC_APRES_AVENANT", precision = 32, scale = 5)
    public BigDecimal getMntMrcApresAvenant() {return mntMrcApresAvenant;}

    @Column(name = "DUREE_AVANCE", precision = 38, scale = 0)
    public BigDecimal getDureeAvance() {
        return dureeAvance;
    }

}
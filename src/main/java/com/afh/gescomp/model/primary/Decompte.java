package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * decompte et factures sur marche
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "Decompte")
@Table(name = "DECOMPTE", schema = "ACHAT")
public class Decompte implements Serializable {
    private static final long serialVersionUID = -7724215934196562607L;
    private DecompteId id;

    /**
     * identifiant du marche
     */
    private MrcEtape mrcEtape;

    private Boolean numModReg;

    /**
     * date de la piece
     */
    private Date datePiece;

    /**
     * Date ordonnoncement
     */
    private Date dateOrd;

    /**
     * date de payement
     */
    private Date datePay;

    /**
     * Type de decompte
     */
    private Short numTypeDecompte;

    /**
     * Numero de piece fournisseur
     */
    private Short numDecompte;

    /**
     * Numero de la facture
     */
    private String numFacture;

    private Date dateControle;

    private Date dateAppCont;

    /**
     * Date de controle de gestion
     */
    private Date dateContGestion;

    /**
     * Montant de la reprise de la reception
     */
    private BigDecimal montantRepRecep;

    /**
     * Description de la reprise de la reception
     */
    private String descRepRecep;

    /**
     * identifiant de la commande
     */
    private String numComm;

    /**
     * 1: s'il veulent solder l'avance
     */
    private Boolean soldeAvance;

    /**
     * 1: s'il veulent partiellement solder l'avance
     */
    private Boolean soldeAvancePar;

    /**
     * 1 s'il a le droit du timbre 0 sinon
     */
    private Boolean dt;

    /**
     * 1 si le paiement sera par pourcentage,  0 sinon
     */
    private Boolean paiementPct;

    /**
     * pct tva par decompte
     */
    private Short pctRetTva;

    /**
     * Num titre de paiement
     */
    private String numTitre;

    private BigDecimal pctRetIr;

    /**
     * Exonoration pénalité
     */
    private Long exPen;

    private Long pctRetGar;

    private Long pctMaxPenalite;

    private Long pctAvancePay;

    private BigDecimal pctVdm;

    private Long pctMaxVdm;

    private Long pctRetApp;

    private Long pctFodec;

    private Long droitTimbre;

    private Date dateTimbre;

    private PrmTypeDec idTypeDec;

    private BigDecimal pctTva;

    /**
     * % RET AVANCE APPLIQUE SUR DECOMPTE
     */
    private BigDecimal pctRetAvApp;

    private BigDecimal pctRealisation;

    @EmbeddedId
    public DecompteId getId() {
        return id;
    }

    @MapsId("id")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumns({
            @JoinColumn(name = "NUM_MARCHE", referencedColumnName = "NUM_MARCHE", nullable = false),
            @JoinColumn(name = "NUM_ETAPE", referencedColumnName = "NUM_ETAPE", nullable = false)
    })
    public MrcEtape getMrcEtape() {
        return mrcEtape;
    }

    @Column(name = "NUM_MOD_REG")
    public Boolean getNumModReg() {
        return numModReg;
    }

    @NotNull
    @Column(name = "DATE_PIECE", nullable = false)
    public Date getDatePiece() {
        return datePiece;
    }

    @Column(name = "DATE_ORD")
    public Date getDateOrd() {
        return dateOrd;
    }

    @Column(name = "DATE_PAY")
    public Date getDatePay() {
        return datePay;
    }

    @Column(name = "NUM_TYPE_DECOMPTE")
    public Short getNumTypeDecompte() {
        return numTypeDecompte;
    }

    @Column(name = "NUM_DECOMPTE")
    public Short getNumDecompte() {
        return numDecompte;
    }

    @Size(max = 13)
    @Column(name = "NUM_FACTURE", length = 13)
    public String getNumFacture() {
        return numFacture;
    }

    @Column(name = "DATE_CONTROLE")
    public Date getDateControle() {
        return dateControle;
    }

    @Column(name = "DATE_APP_CONT")
    public Date getDateAppCont() {
        return dateAppCont;
    }

    @Column(name = "DATE_CONT_GESTION")
    public Date getDateContGestion() {
        return dateContGestion;
    }

    @Column(name = "MONTANT_REP_RECEP", precision = 12, scale = 3)
    public BigDecimal getMontantRepRecep() {
        return montantRepRecep;
    }

    @Size(max = 1000)
    @Column(name = "DESC_REP_RECEP", length = 1000)
    public String getDescRepRecep() {
        return descRepRecep;
    }

    @Size(max = 13)
    @Column(name = "NUM_COMM", length = 13)
    public String getNumComm() {
        return numComm;
    }

    @Column(name = "SOLDE_AVANCE")
    public Boolean getSoldeAvance() {
        return soldeAvance;
    }

    @Column(name = "SOLDE_AVANCE_PAR")
    public Boolean getSoldeAvancePar() {
        return soldeAvancePar;
    }

    @Column(name = "DT")
    public Boolean getDt() {
        return dt;
    }

    @Column(name = "PAIEMENT_PCT")
    public Boolean getPaiementPct() {
        return paiementPct;
    }

    @Column(name = "PCT_RET_TVA")
    public Short getPctRetTva() {
        return pctRetTva;
    }

    @Size(max = 6)
    @Column(name = "NUM_TITRE", length = 6)
    public String getNumTitre() {
        return numTitre;
    }

    @Column(name = "PCT_RET_IR", precision = 4, scale = 2)
    public BigDecimal getPctRetIr() {
        return pctRetIr;
    }

    @Column(name = "EX_PEN")
    public Long getExPen() {
        return exPen;
    }

    @Column(name = "PCT_RET_GAR")
    public Long getPctRetGar() {
        return pctRetGar;
    }

    @Column(name = "PCT_MAX_PENALITE")
    public Long getPctMaxPenalite() {
        return pctMaxPenalite;
    }

    @Column(name = "PCT_AVANCE_PAY")
    public Long getPctAvancePay() {
        return pctAvancePay;
    }

    @Column(name = "PCT_VDM", precision = 38, scale = 3)
    public BigDecimal getPctVdm() {
        return pctVdm;
    }

    @Column(name = "PCT_MAX_VDM")
    public Long getPctMaxVdm() {
        return pctMaxVdm;
    }

    @Column(name = "PCT_RET_APP")
    public Long getPctRetApp() {
        return pctRetApp;
    }

    @Column(name = "PCT_FODEC")
    public Long getPctFodec() {
        return pctFodec;
    }

    @Column(name = "DROIT_TIMBRE")
    public Long getDroitTimbre() {
        return droitTimbre;
    }

    @Column(name = "DATE_TIMBRE")
    public Date getDateTimbre() {
        return dateTimbre;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_TYPE_DEC")
    public PrmTypeDec getIdTypeDec() {
        return idTypeDec;
    }

    @Column(name = "PCT_TVA", precision = 38, scale = 5)
    public BigDecimal getPctTva() {
        return pctTva;
    }

    @Column(name = "PCT_RET_AV_APP", precision = 10, scale = 6)
    public BigDecimal getPctRetAvApp() {
        return pctRetAvApp;
    }

    @Column(name = "PCT_REALISATION", precision = 38, scale = 3)
    public BigDecimal getPctRealisation() {
        return pctRealisation;
    }

}
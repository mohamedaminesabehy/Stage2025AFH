package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Date;

/**
 * les ordres de service
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "OrdreService")
@Table(name = "ORDRE_SERVICE", schema = "ACHAT")
public class OrdreService implements Serializable {
    private static final long serialVersionUID = -3717984358369286393L;
    private OrdreServiceId id;

    /**
     * identifiant du marche
     */
    private MrcEtape mrcEtape;

    /**
     * date demarrage de l'OS
     */
    private Date dateDebut;

    private PrmTypeOrdreService idTypeOrdreService;

    private Date dateFin;

    private String designation;

    private Date dateEditOs;

    private Date dateNotifOs;

    private String codeOrd;

    private Long dureeOs;

    @Column(name = "DUREE_OS")
    public Long getDureeOs() {
        return dureeOs;
    }

    @Size(max = 20)
    @Column(name = "CODE_ORD", length = 20)
    public String getCodeOrd() {
        return codeOrd;
    }

    @Column(name = "DATE_NOTIF_OS")
    public Date getDateNotifOs() {
        return dateNotifOs;
    }

    @Column(name = "DATE_EDIT_OS")
    public Date getDateEditOs() {
        return dateEditOs;
    }

    @Size(max = 2000)
    @Column(name = "DESIGNATION", length = 2000)
    public String getDesignation() {
        return designation;
    }

    @Column(name = "DATE_FIN")
    public Date getDateFin() {
        return dateFin;
    }

    @EmbeddedId
    public OrdreServiceId getId() {
        return id;
    }

    @MapsId("id")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumns({
            @JoinColumn(name = "NUM_MARCHE", referencedColumnName = "NUM_MARCHE", nullable = false),
            @JoinColumn(name = "NUM_ETAPE", referencedColumnName = "NUM_ETAPE", nullable = false)
    })
    public MrcEtape getMrcEtape() {
        return mrcEtape;
    }

    @NotNull
    @Column(name = "DATE_DEBUT", nullable = false)
    public Date getDateDebut() {
        return dateDebut;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_TYPE_ORDRE_SERVICE")
    public PrmTypeOrdreService getIdTypeOrdreService() {
        return idTypeOrdreService;
    }

}
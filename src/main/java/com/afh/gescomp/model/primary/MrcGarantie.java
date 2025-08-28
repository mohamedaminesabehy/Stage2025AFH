package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "MrcGarantie")
@Table(name = "MRC_GARANTIE", schema = "ACHAT")
public class MrcGarantie implements Serializable {
    private static final long serialVersionUID = -6203647588463573553L;
    private MrcGarantieId id;

    private Marche numMarche;

    private TypeGarantie idTypeGarantie;

    private Date dateDebut;

    private Date dateFin;

    private String condMainLevee;

    private Date dateMainLevee;

    private BigDecimal mntGar;

    @EmbeddedId
    public MrcGarantieId getId() {
        return id;
    }

    @MapsId("numMarche")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "NUM_MARCHE", nullable = false)
    public Marche getNumMarche() {
        return numMarche;
    }

    @MapsId("idTypeGarantie")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "ID_TYPE_GARANTIE", nullable = false)
    public TypeGarantie getIdTypeGarantie() {
        return idTypeGarantie;
    }

    @NotNull
    @Column(name = "DATE_DEBUT", nullable = false)
    public Date getDateDebut() {
        return dateDebut;
    }

    @Column(name = "DATE_FIN")
    public Date getDateFin() {
        return dateFin;
    }

    @Size(max = 400)
    @Column(name = "COND_MAIN_LEVEE", length = 400)
    public String getCondMainLevee() {
        return condMainLevee;
    }

    @Column(name = "DATE_MAIN_LEVEE")
    public Date getDateMainLevee() {
        return dateMainLevee;
    }

    @Column(name = "MNT_GAR", precision = 38, scale = 5)
    public BigDecimal getMntGar() {
        return mntGar;
    }

}
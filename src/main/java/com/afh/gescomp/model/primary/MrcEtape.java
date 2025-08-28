package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Etape d'execution dans un marche
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "MrcEtape")
@Table(name = "MRC_ETAPE", schema = "ACHAT")
public class MrcEtape implements Serializable {
    private static final long serialVersionUID = -3050752342094362548L;
    private MrcEtapeId id;

    /**
     * identifiant du marche
     */
    private Marche numMarche;

    private String designation;

    /**
     * duree previsionnelle de l'etape
     */
    private Long dureePrev;

    /**
     * pourcentage de paiement si le paiement sera par phase
     */
    private BigDecimal pctPaiement;

    /**
     * Duree reelle de l'etape
     */
    private Long dureeReelle;

    /**
     * DUREE D'arret de l'etapte
     */
    private Long dureeStop;

    /**
     * NOMBRE JRS RETARD
     */
    private Long dureeRetard;

    @EmbeddedId
    public MrcEtapeId getId() {
        return id;
    }

    @MapsId("numMarche")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "NUM_MARCHE", nullable = false)
    public Marche getNumMarche() {
        return numMarche;
    }

    @Size(max = 120)
    @NotNull
    @Column(name = "DESIGNATION", nullable = false, length = 120)
    public String getDesignation() {
        return designation;
    }

    @Column(name = "DUREE_PREV")
    public Long getDureePrev() {
        return dureePrev;
    }

    @Column(name = "PCT_PAIEMENT", precision = 4, scale = 2)
    public BigDecimal getPctPaiement() {
        return pctPaiement;
    }

    @Column(name = "DUREE_REELLE")
    public Long getDureeReelle() {
        return dureeReelle;
    }

    @Column(name = "DUREE_STOP")
    public Long getDureeStop() {
        return dureeStop;
    }

    @Column(name = "DUREE_RETARD")
    public Long getDureeRetard() {
        return dureeRetard;
    }

}
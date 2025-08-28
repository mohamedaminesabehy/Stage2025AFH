package com.afh.gescomp.model.primary;

import com.afh.gescomp.service.PrmTypeLotService;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "MrcLot")
@Table(name = "MRC_LOT", schema = "ACHAT")
public class MrcLot implements Serializable {
    private static final long serialVersionUID = 6158474510077517621L;
    private MrcLotId id;

    private Marche numMarche;

    private Long idTypeLot;

    private String designation;

    private Long idPrmLot;

    @EmbeddedId
    public MrcLotId getId() {
        return id;
    }

    @MapsId("numMarche")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "NUM_MARCHE", nullable = false)
    public Marche getNumMarche() {
        return numMarche;
    }

    @NotNull
    @ColumnDefault("0")
    @Column(name = "ID_TYPE_LOT", nullable = false)
    public Long getIdTypeLot() {
        return idTypeLot;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

    @Transient
    public Long getIdPrmLot() {
        return idPrmLot;
    }

    public PrmTypeLot getTypeLot(PrmTypeLotService prmTypeLotService) {
        return prmTypeLotService.findById(idTypeLot);
    }

}
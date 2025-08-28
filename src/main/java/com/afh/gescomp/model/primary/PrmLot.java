package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.io.Serializable;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "PrmLot")
@Table(name = "PRM_LOT", schema = "ACHAT")
public class PrmLot implements Serializable {
    private static final long serialVersionUID = -6235253801941253394L;
    private String idLot;

    private String designation;

    private PrmTypeLot idTypeLot;

    @Id
    @Size(max = 100)
    @Column(name = "ID_LOT", nullable = false, length = 100)
    public String getIdLot() {
        return idLot;
    }

    @Size(max = 100)
    @Column(name = "DESIGNATION", length = 100)
    public String getDesignation() {
        return designation;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.NO_ACTION)
    @JoinColumn(name = "ID_TYPE_LOT")
    public PrmTypeLot getIdTypeLot() {
        return idTypeLot;
    }


}
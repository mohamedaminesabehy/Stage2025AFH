package com.afh.gescomp.model.primary;

import javax.persistence.*;

import com.afh.gescomp.config.LocalDateConverter;
import lombok.*;

import java.io.Serializable;
import java.sql.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "PrmTaux")
@Table(name = "PRM_TAUX", schema = "ACHAT")
public class PrmTaux implements Serializable {
    private static final long serialVersionUID = -2349011116830238530L;
    @Id
    @Column(name = "DATE_PARAM", nullable = false)
    private Date id;

    @Column(name = "PCT_FODEC")
    private Long pctFodec;

    @Column(name = "PCT_RET_TVA")
    private Long pctRetTva;

    @Column(name = "PCT_RET_IR")
    private Long pctRetIr;

    @Column(name = "PCT_RET_GAR")
    private Long pctRetGar;

}
package com.afh.gescomp.model.primary;

import lombok.*;
import org.hibernate.Hibernate;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Embeddable
public class DecArticleId implements Serializable {
    private static final long serialVersionUID = 2567348042574755106L;
    private String numArticle;

    /**
     * identifiant du marche
     */
    private Long numMarche;

    /**
     * numero de la piece
     */
    private Short numPieceFourn;

    /**
     * Article principal considere dans la base de calcul
     * 1: article principal (valeur par defaut)
     * 0: article secondaire
     */
    private Short ap ;

    private String idLot;

    private Short idArticle;

    @Size(max = 22)
    @NotNull
    @Column(name = "NUM_ARTICLE", nullable = false, length = 22)
    public String getNumArticle() {
        return numArticle;
    }

    @NotNull
    @Column(name = "NUM_MARCHE", nullable = false)
    public Long getNumMarche() {
        return numMarche;
    }

    @NotNull
    @Column(name = "NUM_PIECE_FOURN", nullable = false)
    public Short getNumPieceFourn() {
        return numPieceFourn;
    }

    @NotNull
    @Column(name = "AP", nullable = false)
    public Short getAp() {
        return ap;
    }

    @Size(max = 20)
    @NotNull
    @Column(name = "ID_LOT", nullable = false, length = 20)
    public String getIdLot() {
        return idLot;
    }

    @NotNull
    @Column(name = "ID_ARTICLE", nullable = false)
    public Short getIdArticle() {
        return idArticle;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        DecArticleId entity = (DecArticleId) o;
        return Objects.equals(this.idLot, entity.idLot) &&
                Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.idArticle, entity.idArticle) &&
                Objects.equals(this.numArticle, entity.numArticle) &&
                Objects.equals(this.numPieceFourn, entity.numPieceFourn) &&
                Objects.equals(this.ap, entity.ap);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idLot, numMarche, idArticle, numArticle, numPieceFourn, ap);
    }

}
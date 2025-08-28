package com.afh.gescomp.model.primary;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.*;
import org.hibernate.Hibernate;
import org.hibernate.annotations.ColumnDefault;

import java.io.Serializable;
import java.util.Objects;

@NoArgsConstructor
@Getter
@Setter
@ToString
@Embeddable
public class MrcArticleId implements Serializable {
    private static final long serialVersionUID = -5734591916447512263L;
    private String numArticle;

    /**
     * identifiant du marche
     */
    private Long numMarche;

    /**
     * Article principal considere dans la base de calcul
     * 1: article principal (valeur par defaut)
     * 0: article secondaire
     */
    private Integer ap = 1;

    /**
     * A supprimer juste pour l'import
     */
    private String idLot;

    private Short idArticle;



    @Size(max = 22)
    @NotNull
    @Column(name = "NUM_ARTICLE", nullable = false, length = 22)
    public String getNumArticle() {
        return numArticle;
    }

    @Column(name = "NUM_MARCHE")
    public Long getNumMarche() {
        return numMarche;
    }

    @NotNull
    @ColumnDefault("1")
    @Column(name = "AP", nullable = false)
    public Integer getAp() {
        return ap;
    }

    @Size(max = 20)
    @NotNull
    @Column(name = "ID_LOT", nullable = false, length = 20)
    public String getIdLot() {
        return idLot;
    }

    @NotNull
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ARTICLE", nullable = false)
    public Short getIdArticle() {
        return idArticle;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        MrcArticleId entity = (MrcArticleId) o;
        return Objects.equals(this.idLot, entity.idLot) &&
                Objects.equals(this.numMarche, entity.numMarche) &&
                Objects.equals(this.idArticle, entity.idArticle) &&
                Objects.equals(this.numArticle, entity.numArticle) &&
                Objects.equals(this.ap, entity.ap);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idLot, numMarche, idArticle, numArticle, ap);
    }

    public MrcArticleId(String numArticle, Long numMarche, Integer ap, String idLot, Short idArticle) {
        this.numArticle = numArticle;
        this.numMarche = numMarche;
        this.ap = ap;
        this.idLot = idLot;
        this.idArticle = idArticle;
    }
    public MrcArticleId(Long numMarche, String numArticle, Integer ap, String idLot, Short idArticle) {
        this.numArticle = numArticle;
        this.numMarche = numMarche;
        this.ap = ap;
        this.idLot = idLot;
        this.idArticle = idArticle;
    }

    public MrcArticleId(Long numMarche, Integer ap, String idLot, String numArticle, Short idArticle) {
        this.numArticle = numArticle;
        this.numMarche = numMarche;
        this.ap = ap;
        this.idLot = idLot;
        this.idArticle = idArticle;
    }

}
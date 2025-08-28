package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.DecArticle;
import com.afh.gescomp.model.primary.DecArticleId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DecArticleRepository extends JpaRepository<DecArticle, DecArticleId> {

    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 0 AND d.id.numPieceFourn = :numPieceFourn AND d.decompte.mrcEtape.id.numEtape = :numEtape order by d.id.idArticle ASC")
    List<DecArticle> findDecArticlesByMarcheAndLotAndAPTravaux(
            @Param("numMarche") Long numMarche,
            @Param("idLot") String idLot,
            @Param("numPieceFourn") Short numPieceFourn,
            @Param("numEtape") Short numEtape);
    //-----------------------//
    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 0 AND d.id.numPieceFourn = :numPieceFourn AND d.decompte.mrcEtape.id.numEtape = :numEtape order by d.id.idArticle ASC")
    Page<DecArticle> findDecArticlesByMarcheAndLotAndAPTravauxPagin(@Param("numMarche") Long numMarche,
                                                                    @Param("idLot") String idLot,
                                                                    @Param("numPieceFourn") Short numPieceFourn,
                                                                    @Param("numEtape") Short numEtape,
                                                                    Pageable pageable);
    //---------------------//

    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 1 AND d.id.numPieceFourn = :numPieceFourn AND d.decompte.mrcEtape.id.numEtape = :numEtape order by d.id.idArticle ASC")
    List<DecArticle> findDecArticlesByMarcheAndLotAndAPAppro(
            @Param("numMarche") Long numMarche,
            @Param("idLot") String idLot,
            @Param("numPieceFourn") Short numPieceFourn,
            @Param("numEtape") Short numEtape);

    //-------------------------//
    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 1 AND d.id.numPieceFourn = :numPieceFourn AND d.decompte.mrcEtape.id.numEtape = :numEtape order by d.id.idArticle ASC")
    Page<DecArticle> findDecArticlesByMarcheAndLotAndAPApproPagin(@Param("numMarche") Long numMarche,
                                                                    @Param("idLot") String idLot,
                                                                    @Param("numPieceFourn") Short numPieceFourn,
                                                                    @Param("numEtape") Short numEtape,
                                                                    Pageable pageable);

    //--------------------------//

    DecArticle findById_NumArticleAndId_NumMarcheAndId_NumPieceFournAndId_ApAndId_IdLotAndId_IdArticle(String numArticle, Long numMarche, Short numPieceFourn, Short ap, String idLot, Short idArticle);

    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 0 AND d.id.numPieceFourn = :numPieceFourn  AND d.decompte.numDecompte = :numDecompte AND (d.quantiteRea IS NOT NULL AND d.quantiteRea != 0)  order by d.id.idArticle ASC ")
    List<DecArticle> findDecArticlesByMarcheAndLotAndAPTravauxDecompte( @Param("numMarche") Long numMarche,
                                                                        @Param("idLot") String idLot,
                                                                        @Param("numPieceFourn") Short numPieceFourn,
                                                                        @Param("numDecompte") Short numDecompte);

    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 1 AND d.id.numPieceFourn = :numPieceFourn  AND d.decompte.numDecompte = :numDecompte AND (d.quantite IS NOT NULL AND d.quantite != 0)  order by d.id.idArticle ASC ")
    List<DecArticle> findDecArticlesByMarcheAndLotAndAPApproDecompte(@Param("numMarche") Long numMarche,
                                                                     @Param("idLot") String idLot,
                                                                     @Param("numPieceFourn") Short numPieceFourn,
                                                                     @Param("numDecompte") Short numDecompte);
    //------------------------------//
    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 0 AND d.id.numPieceFourn = :numPieceFourn AND (d.quantiteRea IS NOT NULL AND d.quantiteRea != 0)  order by d.id.idArticle ASC ")
    List<DecArticle> findDecArticlesByMarcheAndLotAndAPTravauxDecompteLRGfromNetDern( @Param("numMarche") Long numMarche,
                                                                        @Param("idLot") String idLot,
                                                                        @Param("numPieceFourn") Short numPieceFourn);

    @Query("SELECT d FROM DecArticle d WHERE d.id.numMarche = :numMarche AND d.id.idLot = :idLot AND d.id.ap = 1 AND d.id.numPieceFourn = :numPieceFourn AND (d.quantite IS NOT NULL AND d.quantite != 0) order by d.id.idArticle ASC")
    List<DecArticle> findDecArticlesByMarcheAndLotAndAPApproDecompteLRGfromNetDern(@Param("numMarche") Long numMarche,
                                                                     @Param("idLot") String idLot,
                                                                     @Param("numPieceFourn") Short numPieceFourn);


}
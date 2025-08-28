package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Decompte;
import com.afh.gescomp.model.primary.DecompteId;
import com.afh.gescomp.model.primary.PrmTypeDec;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DecompteRepository extends JpaRepository<Decompte, DecompteId> {

    @Query("SELECT d FROM Decompte d " +
            "JOIN d.mrcEtape e " +
            "WHERE d.mrcEtape.numMarche.id = :numMarche " +
            "AND e.id.numEtape = :numEtape AND d.idTypeDec = :idTypeDec")
    List<Decompte> findByNumMarcheAndMrcEtape_NumEtape(@Param("numMarche") Long numMarche,
                                                       @Param("numEtape") Short numEtape,
                                                       @Param("idTypeDec") PrmTypeDec idTypeDec);

    @Query("SELECT d FROM Decompte d " +
            "WHERE d.id.numMarche = :numMarche ")
    List<Decompte> findByNumMarche(@Param("numMarche") Long numMarche);

    Decompte findById_NumMarcheAndId_NumPieceFourn(Long numMarche, Short numPieceFourn);

    @Query("SELECT MAX(d.numDecompte) FROM Decompte d WHERE d.id.numMarche = :numMarche")
    Short findMaxNumDecompteForMarche(@Param("numMarche") Long numMarche);

    @Query("SELECT MAX(d.id.numPieceFourn) FROM Decompte d WHERE d.id.numMarche = :numMarche")
    Short findMaxNumPieceFournForMarche(@Param("numMarche") Long numMarche);

    @Query("SELECT d.idTypeDec.designation, COUNT(d) FROM Decompte d " +
            "WHERE d.id.numMarche = :numMarche " +
            "AND d.mrcEtape.id.numEtape = :numEtape " +
            "GROUP BY d.idTypeDec.designation")
    List<Object[]> countDecomptesGroupedByIdTypeDecAndNumMarcheAndNumEtape(@Param("numMarche") Long numMarche, @Param("numEtape") Short numEtape);

    @Query("SELECT MAX(d.id.numPieceFourn) FROM Decompte d WHERE d.id.numMarche = :numMarche AND d.idTypeDec.id = 4")
    Short findMaxNumPieceFournForMarcheDecLrg(@Param("numMarche") Long numMarche);

    @Query("SELECT d.id.numPieceFourn FROM Decompte d WHERE d.id.numMarche = :numMarche AND d.idTypeDec.id = 2")
    Short findNumPieceFournByTypeDecNEtDer(@Param("numMarche") Long numMarche);
}
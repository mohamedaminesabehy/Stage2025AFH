package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.MrcLot;
import com.afh.gescomp.model.primary.MrcLotId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MrcLotRepository extends JpaRepository<MrcLot, MrcLotId> {
    @Query("SELECT m FROM MrcLot m WHERE m.numMarche.id = :numMarche")
    List<MrcLot> getMrcLotsByNumMarche(@Param("numMarche") Long  numMarche);
    @Query("SELECT m FROM MrcLot m WHERE m.id.idLot = :idLot")
    MrcLot findByIdLot(@Param("idLot") String idLot);
    @Query("SELECT m FROM MrcLot m WHERE m.numMarche.id = :numMarche  AND m.id.idLot = :idLot")
    MrcLot findByNumMarcheAndIdLot(@Param("numMarche") Long  numMarche, @Param("idLot") String  idLot);
}
package com.afh.gescomp.repository.primary;


import com.afh.gescomp.dto.PrmLotDTO;
import com.afh.gescomp.model.primary.PrmLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrmLotRepository extends JpaRepository<PrmLot, String> {
    PrmLot findByIdLot(String idLot);
    @Query("SELECT new com.afh.gescomp.dto.PrmLotDTO(p.idLot, p.designation, p.idTypeLot) FROM PrmLot p")
    List<PrmLotDTO> findPrmLotsDTO();
}
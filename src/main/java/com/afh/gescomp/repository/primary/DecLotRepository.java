package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.DecLot;
import com.afh.gescomp.model.primary.DecLotId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DecLotRepository extends JpaRepository<DecLot, DecLotId> {
  List<DecLot> findById_NumMarcheAndId_NumPieceFournAndId_IdLot(Long numMarche, Long numPieceFourn, String idLot);
}
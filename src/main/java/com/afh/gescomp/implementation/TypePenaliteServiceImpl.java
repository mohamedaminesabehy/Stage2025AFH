package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.TypeGarantie;
import com.afh.gescomp.model.primary.TypePenalite;
import com.afh.gescomp.repository.primary.TypeGarantieRepository;
import com.afh.gescomp.repository.primary.TypePenaliteRepository;
import com.afh.gescomp.service.TypeGarantieService;
import com.afh.gescomp.service.TypePenaliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TypePenaliteServiceImpl implements TypePenaliteService {

    @Autowired
    private TypePenaliteRepository typePenaliteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<TypePenalite> findAllByOrderByIdAsc() {
        return typePenaliteRepository.findAllByOrderByIdAsc();
    }

    @Override
    public void save(TypePenalite typePenalite) {
        String sql = "SELECT COUNT(*) FROM PRM_TYPE_PENALITE";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        if (count != null && count == 0) {
            resetSequence();
        }
        typePenaliteRepository.save(typePenalite);
    }

    @Override
    public TypePenalite findById(Long id) {
        return typePenaliteRepository.findOne(id);
    }

    @Override
    public void deleteTypePenalite(TypePenalite typePenalite) {
        typePenaliteRepository.delete(typePenalite);
    }

    public void resetSequence() {
        String sql = "SELECT COALESCE(MAX(ID_TYPE_PEN), 0) FROM PRM_TYPE_PENALITE";
        Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
        Long startValue = (maxId != null && maxId > 0) ? (maxId + 1) : 1L;
        jdbcTemplate.execute("ALTER SEQUENCE ACHAT.TYPE_PENALITE_SEQ RESTART START WITH " + startValue);
    }

}

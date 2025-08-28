package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.TypeGarantie;
import com.afh.gescomp.repository.primary.TypeGarantieRepository;
import com.afh.gescomp.service.TypeGarantieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TypeGarantieServiceImpl implements TypeGarantieService {
    @Autowired
    private TypeGarantieRepository typeGarantieRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<TypeGarantie> findAllByOrderByIdAsc() {
        return typeGarantieRepository.findAllByOrderByIdAsc();
    }
    @Override
    public void save(TypeGarantie typeGarantie) {
        String sql = "SELECT COUNT(*) FROM PRM_TYPE_GARANTIE";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        if (count != null && count == 0) {
            resetSequence();
        }
        typeGarantieRepository.save(typeGarantie);
    }

    @Override
    public TypeGarantie findById(Long id) {
        return typeGarantieRepository.findOne(id);
    }

    @Override
    @Transactional
    public void deleteTypeGarantie(TypeGarantie typeGarantie) {
        typeGarantieRepository.delete(typeGarantie);
/*        String sqlCount = "SELECT COUNT(*) FROM PRM_TYPE_GARANTIE";
        Long count = jdbcTemplate.queryForObject(sqlCount, Long.class);
        if (count != null && count == 0) {
            resetSequence();
        }*/
    }

    public void resetSequence() {
        String sql = "SELECT COALESCE(MAX(ID_TYPE_GARANTIE), 0) FROM PRM_TYPE_GARANTIE";
        Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
        Long startValue = (maxId != null && maxId > 0) ? (maxId + 1) : 1L;
        jdbcTemplate.execute("ALTER SEQUENCE TYPE_GARANTIE_SEQ RESTART START WITH " + startValue);
    }
}

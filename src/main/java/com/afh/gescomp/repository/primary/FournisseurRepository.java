package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Article;
import com.afh.gescomp.model.primary.Fournisseur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur,Long> {
    List<Fournisseur> findAllByOrderByIdDesc();
    @Query("SELECT f FROM Fournisseur f " +
            "ORDER BY  f.id  DESC")
    Page<Fournisseur> findAllFournisseursWithCustomSorting(Pageable sortedPageable);
    Page<Fournisseur> findByNumFourn(Pageable pageable,String filter);
    @Query("SELECT f FROM Fournisseur f WHERE "
            + "LOWER(f.designationFr) LIKE LOWER(CONCAT('%', :filter, '%'))"
            + "OR LOWER(f.designation) LIKE LOWER(CONCAT('%', :filter, '%'))")
    Page<Fournisseur> findByDesignationFrContainingIgnoreCase(Pageable pageable, @Param("filter") String filter);

    @Query("SELECT f FROM Fournisseur f " +
            "WHERE (:fournisseurDesignation IS NULL OR f.numFourn LIKE CONCAT('%', :fournisseurDesignation, '%')) " +
            "AND (" +
            "(:designation IS NULL OR f.designation LIKE CONCAT('%', :designation, '%')) " +
            "OR (:designation IS NULL OR f.designationFr LIKE CONCAT('%', :designation, '%'))" +
            ")")
    Page<Fournisseur> findAllArticlesWithFilters(@Param("fournisseurDesignation") String fournisseurDesignation,
                                                 @Param("designation") String designation,
                                                 Pageable pageable);

    @Query("SELECT f FROM Fournisseur f WHERE f.id = :id")
    Fournisseur findOneById(@Param("id") Long id);
}

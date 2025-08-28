package com.afh.gescomp.repository.primary;

import com.afh.gescomp.dto.ArticleDTO;
import com.afh.gescomp.model.primary.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


public interface ArticleRepository extends JpaRepository<Article, String> {

    @Query("SELECT a FROM Article a WHERE a.numSectEco = :numSectEco")
    Page<Article> findByNumSectEco(Pageable pageable, @Param("numSectEco") Short numSectEco);

    @Query("SELECT a FROM Article a WHERE a.numSectEco = :numSectEco AND a.numSSectEco = :numSSectEco")
    Page<Article> findByNumSectEcoAndNumSSectEco(Pageable pageable, @Param("numSectEco") Short numSectEco, @Param("numSSectEco") Short numSSectEco);


    @Query(value = "SELECT a FROM Article a ORDER BY  CASE WHEN a.createdAt IS NULL THEN 1 ELSE 0 END, a.createdAt DESC")
    Page<Article> findAllArticlesWithCustomSorting(Pageable pageable);

    @Query("SELECT a FROM Article a WHERE " +
            "LOWER(a.numArticle) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.designationFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.designation) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Article> findByNumArticleContainingIgnoreCaseOrDesignationFrContainingIgnoreCase(Pageable pageable, @Param("searchTerm") String searchTerm);

    @Query("SELECT a FROM Article a WHERE " +
            "LOWER(a.designationFr) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.designation) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Article> findByDesignationFrContainingIgnoreCase(@Param("searchTerm") String searchTerm);

    @Query("SELECT DISTINCT a FROM Article a " +
            "JOIN a.secteur s " +
            "JOIN a.sousSecteur ss " +
            "JOIN a.famille f " +
            "JOIN a.ssFamille sf " +
            "WHERE (:filter IS NULL OR a.numArticle = :filter) " +
            "AND (:secteurDesignation IS NULL OR s.designation = :secteurDesignation) " +
            "AND (:ssecteurDesignation IS NULL OR ss.designation = :ssecteurDesignation) " +
            "AND (:familleDesignation IS NULL OR f.designation = :familleDesignation) " +
            "AND (:ssFamilleDesignation IS NULL OR sf.designation = :ssFamilleDesignation) " +
            "AND (:designationFr IS NULL OR a.designationFr LIKE CONCAT('%', :designationFr, '%') OR a.designation LIKE CONCAT('%', :designationFr, '%'))")
    Page<Article> findAllArticlesWithFiltersAndSorting(@Param("filter") String filter,
                                                       @Param("secteurDesignation") String secteurDesignation,
                                                       @Param("ssecteurDesignation") String ssecteurDesignation,
                                                       @Param("familleDesignation") String familleDesignation,
                                                       @Param("ssFamilleDesignation") String ssFamilleDesignation,
                                                       @Param("designationFr") String designationFr,
                                                       Pageable pageable);

}
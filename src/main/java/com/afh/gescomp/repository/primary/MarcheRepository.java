package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Marche;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MarcheRepository extends JpaRepository<Marche, Long> {
    /**
     * Récupère tous les marchés associés à un fournisseur
     * @param numFourn Numéro du fournisseur
     * @return Liste des marchés du fournisseur
     */
    @Query("SELECT m FROM Marche m WHERE m.numFourn = :numFourn ORDER BY m.dateMarche DESC")
    List<Marche> findByFournisseurNumFourn(@Param("numFourn") String numFourn);
    Marche findById(Long numMarche);
    //----------------------------------//
/*    @Query("SELECT m FROM Marche m WHERE m.id = :filter AND m.designation LIKE %:designation% AND m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByIdAndDesignationContainingAndIdFourn_DesignationContaining(@Param("filter") Long filter, @Param("designation") String designation, @Param("fournisseurDesignation") String fournisseurDesignation, Pageable pageable);
    Page<Marche> findByIdOrDesignationContaining(Long filter, String filter1, Pageable sortedPageable);
    @Query("SELECT m FROM Marche m WHERE m.id = :numMarche AND m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByIdAndIdFourn_DesignationContaining(@Param("numMarche") Long numMarche, @Param("fournisseurDesignation") String fournisseurDesignation, Pageable sortedPageable);
    @Query("SELECT m FROM Marche m WHERE m.designation LIKE %:designation% AND m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByDesignationContainingAndIdFourn_DesignationContaining(@Param("designation") String designation, @Param("fournisseurDesignation") String fournisseurDesignation, Pageable pageable);
    Page<Marche> findById(Long numMarche, Pageable pageable);
    @Query("SELECT m FROM Marche m WHERE LOWER(m.designation) LIKE LOWER(CONCAT('%', :designation, '%')) OR UPPER(m.designation) LIKE UPPER(CONCAT('%', :designation, '%'))")
    Page<Marche> findByDesignationContaining(Pageable pageable, @Param("designation") String designation);
    @Query("SELECT m FROM Marche m WHERE m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByFournisseurDesignation(@Param("fournisseurDesignation") String fournisseurDesignation, Pageable pageable);*/
    //--------------------------//
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND m.id = :filter " +
            "AND m.designation LIKE %:designation% " +
            "AND m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByIdAndDesignationContainingAndIdFourn_DesignationContaining(@Param("filter") Long filter, @Param("designation") String designation, @Param("fournisseurDesignation") String fournisseurDesignation, @Param("numStruct") String numStruct, Pageable pageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND (m.id = :filter OR m.designation LIKE %:filter1%)")
    Page<Marche> findByIdOrDesignationContaining(@Param("filter") Long filter, @Param("filter1") String filter1, @Param("numStruct") String numStruct, Pageable sortedPageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND m.id = :numMarche " +
            "AND m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByIdAndIdFourn_DesignationContaining(@Param("numMarche") Long numMarche, @Param("fournisseurDesignation") String fournisseurDesignation, @Param("numStruct") String numStruct, Pageable sortedPageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND m.designation LIKE %:designation% " +
            "AND m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByDesignationContainingAndIdFourn_DesignationContaining(@Param("designation") String designation, @Param("fournisseurDesignation") String fournisseurDesignation, @Param("numStruct") String numStruct, Pageable pageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND m.id = :numMarche")
    Page<Marche> findById(@Param("numMarche") Long numMarche, @Param("numStruct") String numStruct, Pageable pageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND (LOWER(m.designation) LIKE LOWER(CONCAT('%', :designation, '%')) OR UPPER(m.designation) LIKE UPPER(CONCAT('%', :designation, '%')))")
    Page<Marche> findByDesignationContaining(@Param("designation") String designation, @Param("numStruct") String numStruct, Pageable pageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND m.idFourn.designation LIKE %:fournisseurDesignation%")
    Page<Marche> findByFournisseurDesignation(@Param("fournisseurDesignation") String fournisseurDesignation, @Param("numStruct") String numStruct, Pageable pageable);
    //------------------------//
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "ORDER BY m.id DESC")
    Page<Marche> findAllMarchesWithCustomSorting(Pageable pageable, @Param("numStruct") String numStruct);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND LOWER(m.designation) LIKE LOWER(CONCAT('%', :designation, '%')) " +
            "ORDER BY m.id DESC")
    Page<Marche> findByDesignationContainingIgnoreCaseAndNumStruct(@Param("designation") String designation, @Param("numStruct") String numStruct,Pageable pageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND (m.id = :id OR LOWER(m.designation) LIKE LOWER(CONCAT('%', :designation, '%'))) " +
            "ORDER BY m.id DESC")
    Page<Marche> findByIdOrDesignationContainingIgnoreCaseAndNumStruct(@Param("id") Long id, @Param("designation") String designation, @Param("numStruct") String numStruct,  Pageable pageable);
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "ORDER BY m.id DESC")
    Page<Marche> findAllByNumStruct(@Param("numStruct") String numStruct, Pageable pageable);

    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "ORDER BY m.id DESC")
    List<Marche> getAllMarchesNoPaginAndSearch(@Param("numStruct") String numStruct);

    @Query("SELECT COUNT(m) FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct)")
    Long countByNumStruct(@Param("numStruct") String numStruct);
    
    @Query("SELECT m FROM Marche m " +
            "WHERE (:numStruct = '03' OR m.idStructure.numStruct = :numStruct) " +
            "AND m.numFourn = :numFourn " +
            "ORDER BY m.id DESC")
    Page<Marche> findByNumFourn(@Param("numFourn") String numFourn, @Param("numStruct") String numStruct, Pageable pageable);
    
    /**
     * Récupère tous les marchés d'un fournisseur spécifique
     * @param numFourn Numéro du fournisseur
     * @return Liste des marchés du fournisseur
     */
    @Query("SELECT m FROM Marche m WHERE m.numFourn = :numFourn ORDER BY m.id DESC")
    List<Marche> findByNumFournOrderByIdDesc(@Param("numFourn") String numFourn);
}
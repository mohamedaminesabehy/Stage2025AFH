package com.afh.gescomp.implementation;

import com.afh.gescomp.dto.DecompteResponse;
import com.afh.gescomp.exception.PrmTypeDecNotFoundException;
import com.afh.gescomp.exception.ResourceNotFoundException;
import com.afh.gescomp.model.primary.Decompte;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.model.primary.PrmTypeDec;
import com.afh.gescomp.payload.response.MessageResponse;
import com.afh.gescomp.payload.response.StatutResponse;
import com.afh.gescomp.repository.primary.DecompteRepository;
import com.afh.gescomp.repository.primary.MrcEtapeRepository;
import com.afh.gescomp.repository.primary.PrmTypeDecRepository;
import com.afh.gescomp.service.DecompteService;
import com.afh.gescomp.service.MarcheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.sql.DataSource;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;
import java.util.*;

@Service
public class DecompteServiceImpl implements DecompteService {

    @Autowired
    private EntityManager entityManager;
    @Autowired
    private DataSource dataSource;
    @Autowired
    private DecompteRepository decompteRepository;
    @Autowired
    private PrmTypeDecRepository prmTypeDecRepository;
    @Autowired
    private MrcEtapeRepository mrcEtapeRepository;
    @Autowired
    private MarcheService marcheService;

    @Override
    public List<Decompte> getDecompteByNumMarcheAndNumEtapeAndIdTypeDec(Long numMarche, Short numEtape, Long idTypeDec) {
     /*   Pageable sortedPageable = new PageRequest(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );*/

        PrmTypeDec idTypeDecObj = prmTypeDecRepository.findOne(idTypeDec);
        if (idTypeDecObj == null) {
            // Lever une exception si l'objet n'est pas trouvé
            throw new PrmTypeDecNotFoundException("Le type de décision avec l'ID " + idTypeDec + " n'a pas été trouvé");
        }
        // Ensuite, appelez le repository pour les décomptes
        return decompteRepository.findByNumMarcheAndMrcEtape_NumEtape(numMarche, numEtape, idTypeDecObj);
    }

    @Transactional
    @Override
    public DecompteResponse insertDecompte(Long numMarche, java.sql.Date datePiece, Long idTypeDec, Long numEtape, Short soldeAvance) {
        try {
            String sql = "CALL PKG_CREE_DEC.INSERT_DEC(:numMarche, :datePiece, :idTypeDec, :numEtape, :soldeAvance)";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("numMarche", numMarche);
            query.setParameter("datePiece", datePiece);
            query.setParameter("idTypeDec", idTypeDec);
            query.setParameter("numEtape", numEtape);
            query.setParameter("soldeAvance", soldeAvance);

            query.executeUpdate();

            // Récupérer le numéro de pièce fournisseur ajouté (le plus récent)
            String getDecompteQuery = "SELECT MAX(d.id.numPieceFourn) FROM Decompte d WHERE d.id.numMarche = :numMarche";
            Query getDecompte = entityManager.createQuery(getDecompteQuery);
            getDecompte.setParameter("numMarche", numMarche);
            Short numPieceFourn = (Short) getDecompte.getSingleResult();

            return new DecompteResponse(true, "Décompte ajouté avec succès", numPieceFourn);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'insertion du décompte", e);
        }
    }


    @Transactional
    @Override
    public void deleteDecompte(Long numMarche, Long numPieceFourn) {
        try {
            // Appel de la procédure stockée INSERT_DEC
            String sql = "CALL DELETE_DEC(:numMarche, :numPieceFourn)";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("numMarche", numMarche);
            query.setParameter("numPieceFourn", numPieceFourn);
            // Exécuter la procédure
            query.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de l'insertion du décompte", e);
        }
    }

    @Transactional
    @Override
    public String calculMontantDecAvanceDecompte(Long numMarche) {
        try {
            // Appel de la procédure stockée CAL_MARCHE avec le paramètre numMarche
            String sql = "CALL CAL_DEC_AVANCE(:numMarche)";
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("numMarche", numMarche);
            // Exécuter la procédure
            query.executeUpdate();

            // Retourner un message de succès
            return "Calcul des montants effectué avec succès";
        } catch (Exception e) {
            // Retourner un message d'erreur
            throw new RuntimeException("Erreur lors du calcul des montants pour le marché: " + numMarche, e);
        }
    }

    @Override
    public List<Decompte> findDecomptesByNumMarche(Long numMarche) {
        return decompteRepository.findByNumMarche(numMarche);
    }

    @Override
    public void updateExPen(Long numMarche, Short numPieceFourn, Long exPenValue) {
        Decompte decompte = decompteRepository.findById_NumMarcheAndId_NumPieceFourn(numMarche, numPieceFourn);
        if (decompte != null) {
            decompte.setExPen(exPenValue);  // Met à jour la valeur de ExPen
            decompteRepository.save(decompte);  // Sauvegarde les modifications
        } else {
            throw new ResourceNotFoundException("Decompte not found for numMarche " + numMarche + " and numPieceFourn " + numPieceFourn);
        }
    }

    @Override
    public DecompteResponse UpdateDatePieceSoldeAvanceDecompte(Long numMarche, Short numPieceFourn, Date datePiece, Boolean soldeAvance) {
        Decompte decompte = decompteRepository.findById_NumMarcheAndId_NumPieceFourn(numMarche, numPieceFourn);

        if (decompte != null) {
            decompte.setDatePiece(datePiece);
            decompte.setSoldeAvance(soldeAvance);
            decompteRepository.save(decompte);

            return new DecompteResponse(true, "Décompte mis à jour avec succès", numPieceFourn);
        } else {
            throw new ResourceNotFoundException("Décompte introuvable pour numMarche " + numMarche + " et numPieceFourn " + numPieceFourn);
        }
    }

    @Override
    public Short getNumDecompte(Long numMarche, Short numPieceFourn) {
        Decompte decompte = decompteRepository.findById_NumMarcheAndId_NumPieceFourn(numMarche, numPieceFourn);
        if (decompte != null) {
            // Si numDecompte est null, on retourne le numPieceFourn à la place
            return (decompte.getNumDecompte() != null) ? decompte.getNumDecompte() : decompte.getId().getNumPieceFourn();
        }
        return null;
    }


    @Transactional
    @Override
    public ResponseEntity<?> getStatutFin(Long numMarche, Short numPieceFourn) {
        try {
            String result = "";
            String sql = "SELECT GET_STATUT_FIN(:v_num_marche, :v_num_piece_fourn) FROM dual";

            // Exécuter la requête SQL native
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("v_num_marche", numMarche);
            query.setParameter("v_num_piece_fourn", numPieceFourn);

            // Récupérer le résultat de la fonction SQL
            result = (String) query.getSingleResult();

            // Si le résultat est null, on retourne un statut 200 OK avec un message spécifique
            if (result == null) {
                return ResponseEntity.ok(new StatutResponse("Statut non trouvé"));
            }

            // Sinon, on retourne le statut trouvé avec un statut 200 OK
            return ResponseEntity.ok(new StatutResponse(result));

        } catch (Exception e) {
            // En cas d'exception (problème serveur), retourner une erreur 500
            return ResponseEntity.status(500).body(new StatutResponse("Erreur serveur : " + e.getMessage()));
        }
    }

    @Override
    public Short getMaxNumDecompteForMarche(Long numMarche) {
        return decompteRepository.findMaxNumDecompteForMarche(numMarche);
    }

    @Override
    public Short getMaxNumPieceFournForMarche(Long numMarche) {
        return decompteRepository.findMaxNumPieceFournForMarche(numMarche);
    }

    private static final List<String> allDecompteTypes = Arrays.asList(
            "FLUCT", "ORD / NORMALE", "N ET DERNIER", "AVANCE", "LRG", "RBANCAIRE"
    );

    @Override
    public Map<String, Object> getDecompteCountGroupedByIdTypeDecAndNumMarcheAndNumEtape(Long numMarche, Short numEtape) {
        List<Object[]> results = decompteRepository.countDecomptesGroupedByIdTypeDecAndNumMarcheAndNumEtape(numMarche, numEtape);

        // LinkedHashMap pour maintenir l'ordre d'insertion
        Map<String, Object> response = new LinkedHashMap<>();

        // Initialiser le total des counts
        long totalCount = 0;

        // Créer un map pour stocker les counts par type de décompte
        Map<String, Long> decompteMap = new HashMap<>();

        // Initialiser tous les types avec un count de 0
        for (String type : allDecompteTypes) {
            decompteMap.put(type, 0L);
        }

        // Itérer sur les résultats pour ajouter chaque type de décompte et son count
        for (Object[] result : results) {
            String idTypeDec = (String) result[0]; // Désignation de idTypeDec
            Long count = (Long) result[1];          // Compte pour chaque groupe

            // Mettre à jour le map avec le count récupéré
            decompteMap.put(idTypeDec, count);

            // Ajouter au total
            totalCount += count;
        }

        // Ajouter chaque type de décompte avec son count dans le response
        for (Map.Entry<String, Long> entry : decompteMap.entrySet()) {
            response.put(entry.getKey(), entry.getValue());
        }

        // Ajouter le total à la fin de la réponse sous la clé "Total"
        response.put("Total", totalCount);

        return response;

    }

    @Transactional
    @Override
    public ResponseEntity<MessageResponse> envoyerDecompteAuFinancier(Long numMarche, Short numPieceFourn, String numStruct, String nomUser) {
        String msg = null;
        CallableStatement callableStatement = null;
        try {
            Connection connection = dataSource.getConnection();
            String sql = "{ call PKG_ENVOI.ENVOI_DECOMPTE(?, ?, ?, ?, ?) }";
            callableStatement = connection.prepareCall(sql);
            callableStatement.setLong(1, numMarche);
            callableStatement.setShort(2, numPieceFourn);
            callableStatement.setString(3, numStruct);
            callableStatement.setString(4, nomUser);
            callableStatement.registerOutParameter(5, java.sql.Types.VARCHAR);
            callableStatement.executeUpdate();
            msg = callableStatement.getString(5);
        } catch (SQLException e) {
            e.printStackTrace();
            msg = "Erreur lors de l'exécution de la procédure : " + e.getMessage();
        }
        MessageResponse messageResponse = new MessageResponse(msg);
        return ResponseEntity.ok(messageResponse);
    }

    @Override
    public Short findMaxNumPieceFournForMarcheDecLrg(Long numMarche) {
        return decompteRepository.findMaxNumPieceFournForMarcheDecLrg(numMarche);
    }

    @Override
    public Short findNumPieceFournByTypeDecNEtDer(Long numMarche) {
        return  decompteRepository.findNumPieceFournByTypeDecNEtDer(numMarche);
    }

    @Override
    public boolean isDateDecompteValide(Long numMarche, Date datePiece) {
        boolean result = false;

        // Vérification que la date n'est pas nulle
        if (datePiece == null) {
            throw new IllegalArgumentException("La date du décompte ne peut pas être nulle");
        }

        try (Connection connection = dataSource.getConnection();
             CallableStatement stmt = connection.prepareCall("{ ? = call PKG_CREE_DEC.DATE_DECOMPTE_VALIDE(?, ?) }")) {

            // Enregistrer la sortie de la fonction (1 pour TRUE, 0 pour FALSE)
            stmt.registerOutParameter(1, Types.INTEGER);

            // Passer les paramètres d'entrée : numMarche et datePiece
            stmt.setLong(2, numMarche);

            // Convertir correctement la date (sans heure)
            stmt.setDate(3, new java.sql.Date(datePiece.getTime()));  // Conversion vers java.sql.Date

            // Exécuter la procédure
            stmt.execute();

            // Récupérer le résultat de la procédure et déterminer la validité de la date
            result = stmt.getInt(1) == 1;

        } catch (SQLException e) {
            // Log de l'erreur pour faciliter le diagnostic
            e.printStackTrace();
            // Vous pouvez aussi enregistrer un message d'erreur dans un log si vous le souhaitez
        }

        return result;
    }

    @Override
    public boolean isDateDecompteValideForUpdate(Long numMarche, Date datePiece, Short numPieceFourn) {

        Short previousNumPieceFourn = (short) (numPieceFourn - 1); // Conversion explicite en Short

        // Récupérer le décompte précédent avec numPieceFourn - 1
        Decompte previousDecompte = decompteRepository.findById_NumMarcheAndId_NumPieceFourn(numMarche, previousNumPieceFourn);

        // Si un décompte précédent existe
        if (previousDecompte != null) {
            // Comparer les dates
            Date previousDate = previousDecompte.getDatePiece();
            return datePiece.after(previousDate); // La date de modification doit être après la date précédente
        }  else {
            // Aucun décompte précédent, on compare avec la date du marché
            Marche marche = marcheService.findMarcheByNumMarche(numMarche); // Sans Optional
            if (marche != null && marche.getDateMarche() != null) {
                return datePiece.after(marche.getDateMarche());
            } else {
                // Marché introuvable ou date null, retour invalide
                return false;
            }
        }
    }


}



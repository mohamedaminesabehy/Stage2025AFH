package com.afh.gescomp.controller;

import com.afh.gescomp.dto.DecompteResponse;
import com.afh.gescomp.exception.MrcEtapeNotFoundException;
import com.afh.gescomp.exception.PrmTypeDecNotFoundException;
import com.afh.gescomp.model.primary.Decompte;
import com.afh.gescomp.payload.response.MessageResponse;
import com.afh.gescomp.repository.primary.DecompteRepository;
import com.afh.gescomp.service.DecArticleService;
import com.afh.gescomp.service.DecompteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/decomptes")
public class DecompteController {

    @Autowired
    public DecompteService decompteService;

    @Autowired
    private DecompteRepository decompteRepository;

    @Autowired
    private DecArticleService decArticleService;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<Decompte>> getDecomptesByNumMarcheAndIdTypeDec(
            @RequestParam("numMarche") Long numMarche,
            @RequestParam("numEtape") Short numEtape,
            @RequestParam("idTypeDec") Long idTypeDec) {

        try {
            //Pageable pageable = new PageRequest(page, size);
            List<Decompte> decomptes = decompteService.getDecompteByNumMarcheAndNumEtapeAndIdTypeDec(numMarche, numEtape,idTypeDec);
            return new ResponseEntity<>(decomptes, HttpStatus.OK);
        } catch (MrcEtapeNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (PrmTypeDecNotFoundException e) {
            // En cas d'exception, renvoyer une réponse 404 avec le message d'erreur
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @RequestMapping(value = "/ajouter",method = RequestMethod.POST)
    public ResponseEntity<DecompteResponse> ajouterDecompte(
            @RequestParam Long numMarche,
            @RequestParam String datePiece,
            @RequestParam Long idTypeDec,
            @RequestParam Long numEtape,
            @RequestParam Short soldeAvance) {
        java.sql.Date sqlDate;
        try {
            // Conversion manuelle de String vers java.sql.Date
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            java.util.Date parsedDate = sdf.parse(datePiece);
            sqlDate = new java.sql.Date(parsedDate.getTime());
        } catch (ParseException e) {
            return ResponseEntity.badRequest()
                    .body(new DecompteResponse(false, "Format de date invalide. Utilisez yyyy-MM-dd", null));
        }

        try {
            DecompteResponse response = decompteService.insertDecompte(numMarche, sqlDate, idTypeDec, numEtape, soldeAvance);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new DecompteResponse(false, "Erreur lors de l'insertion du décompte", null));
        }
    }

    @RequestMapping(value = "/UpdateDatePieceSoldeAvanceDecompte", method = RequestMethod.PATCH)
    public ResponseEntity<DecompteResponse> UpdateDatePieceSoldeAvanceDecompte(@RequestParam("numMarche") Long numMarche,
                                                           @RequestParam("numPieceFourn") Short numPieceFourn,
                                                           @RequestParam("datePiece") java.util.Date datePiece,
                                                           @RequestParam("soldeAvance") Boolean soldeAvance) {
        DecompteResponse response = decompteService.UpdateDatePieceSoldeAvanceDecompte(numMarche, numPieceFourn, datePiece, soldeAvance);
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/supprimer",method = RequestMethod.POST)
    public void supprimerDecompte(
            @RequestParam Long numMarche,
            @RequestParam Long numPieceFourn) {
        decompteService.deleteDecompte(numMarche, numPieceFourn);
    }

    @RequestMapping(value = "/calculateMontantDecAvanceDecompte/{numMarche}", method = RequestMethod.GET)
    public ResponseEntity<Map<String, String>> calculMontantDecAvanceDecompte(
            @PathVariable("numMarche") Long numMarche) {
        try {
            String result = decompteService.calculMontantDecAvanceDecompte(numMarche);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);  // Utilisation de la chaîne de texte "Calcul des montants effectué avec succès"

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur lors du calcul des montants: " + e.getMessage());

            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/calculateMontantDecOrdDecompte/{numMarche}/{numPieceFourn}/{numEtape}", method = RequestMethod.GET)
    public ResponseEntity<Map<String, String>> calculateMontantsFinalDecArticlesOrd(
            @PathVariable("numMarche") Long numMarche,
            @PathVariable("numPieceFourn") Short numPieceFourn,
            @PathVariable("numEtape") Short numEtape) {
        try {
            // Appel à la méthode de service
            String result = decArticleService.calculateMontantsFinalDecArticlesOrd(numMarche, numPieceFourn, numEtape);

            // Créer un objet de réponse avec un message de succès
            Map<String, String> response = new HashMap<>();
            response.put("message", result);  // Utilisation de la chaîne de texte "Calcul des montants effectué avec succès"

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            // Créer un objet de réponse avec un message d'erreur
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur lors du calcul des montants: " + e.getMessage());

            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/calculateMontantDecLrgDecompte/{numMarche}/{numPieceFourn}", method = RequestMethod.GET)
    public ResponseEntity<Map<String, String>> calculateMontantsFinalDecArticlesLrg(
            @PathVariable("numMarche") Long numMarche,
            @PathVariable("numPieceFourn") Short numPieceFourn) {
        try {
            String result = decArticleService.calculateMontantsFinalDecArticlesLrg(numMarche, numPieceFourn);
            Map<String, String> response = new HashMap<>();
            response.put("message", result);

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur lors du calcul des montants: " + e.getMessage());

            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/getAllByNumMarche",method = RequestMethod.GET)
    public ResponseEntity<List<Decompte>> getAllDecomptesByNumMarche(
            @RequestParam("numMarche") Long numMarche
    ){
            List<Decompte> decomptes = decompteService.findDecomptesByNumMarche(numMarche);
            return new ResponseEntity<>(decomptes, HttpStatus.OK);
    }

    @RequestMapping(value = "/updateExPen", method = RequestMethod.PATCH)
    public ResponseEntity<Map<String, String>> updateExPen(@RequestParam("numMarche") Long numMarche,
                                                           @RequestParam("numPieceFourn") Short numPieceFourn,
                                                           @RequestParam Long exPenValue) {
        try {
            decompteService.updateExPen(numMarche, numPieceFourn, exPenValue);
            Map<String, String> response = new HashMap<>();
            response.put("message", "ExPen updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error updating ExPen");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    @RequestMapping(value = "/getDetailsDecompte",method = RequestMethod.GET)
    public ResponseEntity<Decompte> getDecompteDetails(@RequestParam("numMarche") Long numMarche, @RequestParam("numPieceFourn") Short numPieceFourn){
        Decompte decompte = decompteRepository.findById_NumMarcheAndId_NumPieceFourn(numMarche, numPieceFourn);
        return new ResponseEntity<>(decompte, HttpStatus.OK);
    }

    @RequestMapping(value = "/getNumDecompte/{numMarche}/{numPieceFourn}",method = RequestMethod.GET)
    public ResponseEntity<?> getNumDecompte(@PathVariable Long numMarche, @PathVariable Short numPieceFourn) {
        Short numDecompte = decompteService.getNumDecompte(numMarche, numPieceFourn);

        if (numDecompte != null) {
            // Si numDecompte est trouvé, on renvoie la valeur
            return ResponseEntity.ok(numDecompte);
        } else {
            // Si numDecompte n'est pas trouvé, on renvoie une erreur 404
            return ResponseEntity.notFound().build();
        }
    }

    @RequestMapping(value = "/status",method = RequestMethod.GET)
    public ResponseEntity<?> getStatusDecompteFin(@RequestParam("numMarche") Long numMarche, @RequestParam("numPieceFourn") Short numPieceFourn) {
        return decompteService.getStatutFin(numMarche, numPieceFourn);
    }

    @RequestMapping(value = "/getMaxNumDecompte",method = RequestMethod.GET)
    public ResponseEntity<Short> getMaxDecompte(@RequestParam("numMarche") Long numMarche) {
        Short maxNumDecompte = decompteService.getMaxNumDecompteForMarche(numMarche);
            return ResponseEntity.ok(maxNumDecompte);
    }

    @RequestMapping(value = "/getMaxNumPieceFourn",method = RequestMethod.GET)
    public ResponseEntity<Short> getMaxNumPieceFourn(@RequestParam("numMarche") Long numMarche) {
        Short maxNumPieceFourn = decompteService.getMaxNumPieceFournForMarche(numMarche);
        return ResponseEntity.ok(maxNumPieceFourn);
    }

    @RequestMapping(value = "/countByTypeDec",method = RequestMethod.GET)
    public Map<String, Object> getDecompteCountGroupedByIdTypeDecAndNumMarcheAndNumEtape(@RequestParam("numMarche") Long numMarche, @RequestParam("numEtape") Short numEtape) {
        return decompteService.getDecompteCountGroupedByIdTypeDecAndNumMarcheAndNumEtape(numMarche, numEtape);
    }

    @RequestMapping(value = "/envoyerDecFin",method = RequestMethod.POST)
    public ResponseEntity<MessageResponse> envoyerDecompteAuFinancier(@RequestParam("numMarche") Long numMarche,
                                                                      @RequestParam("numPieceFourn") Short numPieceFourn,
                                                                      @RequestParam("numStruct") String numStruct,
                                                                      @RequestParam("nomUser") String nomUser) {
       return decompteService.envoyerDecompteAuFinancier(numMarche, numPieceFourn, numStruct, nomUser);
    }

    @RequestMapping(value ="/numPieceFournNetDer",method = RequestMethod.GET)
    public ResponseEntity<?> getNumPieceFournForNetDer(@RequestParam("numMarche") Long numMarche) {
        Short numPieceFourn = decompteService.findNumPieceFournByTypeDecNEtDer(numMarche);
        if (numPieceFourn != null) {
            return ResponseEntity.ok(numPieceFourn); // 200 OK
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Aucun décompte Net Dernier trouvé pour ce marché.");
        }
    }

    @RequestMapping(value ="/validerDatePieceDecompte",method = RequestMethod.GET)
    public ResponseEntity<Boolean> validerDateDecompte(
            @RequestParam("numMarche") Long numMarche,
            @RequestParam("datePiece") @DateTimeFormat(pattern = "yyyy-MM-dd") java.util.Date datePiece) {

        boolean isValid = decompteService.isDateDecompteValide(numMarche, datePiece);
        return ResponseEntity.ok(isValid);
    }

    @RequestMapping(value ="/validerDateDecompteForUpdate",method = RequestMethod.GET)
    public ResponseEntity<Boolean> validerDateDecompteForUpdate(
            @RequestParam("numMarche") Long numMarche,
            @RequestParam("datePiece") @DateTimeFormat(pattern = "yyyy-MM-dd") java.util.Date datePiece,
            @RequestParam("numPieceFourn") Short numPieceFourn) {

        boolean isValid = decompteService.isDateDecompteValideForUpdate(numMarche, datePiece, numPieceFourn);
        return ResponseEntity.ok(isValid);
    }

}

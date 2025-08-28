package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.DecArticle;
import com.afh.gescomp.payload.request.DecArticleUpdateRequest;
import com.afh.gescomp.payload.response.MontantResponse;
import com.afh.gescomp.service.DecArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/decArticles")
public class DecArticleController {
    @Autowired
    private DecArticleService decArticleService;

    @RequestMapping(value = "/travaux", method = RequestMethod.GET)
    public List<DecArticle> getDecArticlesTravaux(@RequestParam("numMarche") Long numMarche, @RequestParam("idLot") String idLot, @RequestParam("numPieceFourn") Short numPieceFourn, @RequestParam("numEtape") Short numEtape) {
        return decArticleService.getDecArticlesTravaux(numMarche, idLot, numPieceFourn, numEtape);
    }
    //------------------------//
    @RequestMapping(value = "/travauxPagin", method = RequestMethod.GET)
    @ResponseBody
    public Page<DecArticle> getDecArticlesTravaux(
            @RequestParam("numMarche") Long numMarche,
            @RequestParam("idLot") String idLot,
            @RequestParam("numPieceFourn") Short numPieceFourn,
            @RequestParam("numEtape") Short numEtape,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = new PageRequest(page, size);
        return decArticleService.getDecArticlesTravauxPagin(numMarche, idLot, numPieceFourn, numEtape, pageable);
    }

    //------------------------//
    @RequestMapping(value = "/appro", method = RequestMethod.GET)
    public List<DecArticle> getDecArticlesAppro(@RequestParam("numMarche") Long numMarche, @RequestParam("idLot") String idLot, @RequestParam("numPieceFourn") Short numPieceFourn, @RequestParam("numEtape") Short numEtape) {
        return decArticleService.getDecArticlesAppro(numMarche, idLot, numPieceFourn, numEtape);
    }
    //---------------------//
    @RequestMapping(value = "/approPagin", method = RequestMethod.GET)
    @ResponseBody
    public Page<DecArticle> getDecArticlesAppro(
            @RequestParam("numMarche") Long numMarche,
            @RequestParam("idLot") String idLot,
            @RequestParam("numPieceFourn") Short numPieceFourn,
            @RequestParam("numEtape") Short numEtape,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = new PageRequest(page, size);
        return decArticleService.getDecArticlesApproPagin(numMarche, idLot, numPieceFourn, numEtape, pageable);
    }
    //--------------------//
    @RequestMapping(value = "/travauxDecompte", method = RequestMethod.GET)
    public List<DecArticle> getDecArticlesTravauxDecompte(@RequestParam("numMarche") Long numMarche, @RequestParam("idLot") String idLot, @RequestParam("numPieceFourn") Short numPieceFourn,  @RequestParam("numDecompte") Short numDecompte) {
        return decArticleService.getDecArticlesTravauxDecompte(numMarche, idLot, numPieceFourn, numDecompte);
    }

    @RequestMapping(value = "/approDecompte", method = RequestMethod.GET)
    public List<DecArticle> getDecArticlesApproDecompte(@RequestParam("numMarche") Long numMarche, @RequestParam("idLot") String idLot, @RequestParam("numPieceFourn") Short numPieceFourn,  @RequestParam("numDecompte") Short numDecompte) {
        return decArticleService.getDecArticlesApproDecompte(numMarche, idLot, numPieceFourn, numDecompte);
    }

    @RequestMapping(value = "/travauxDecompteLRG", method = RequestMethod.GET)
    public List<DecArticle> getDecArticlesTravauxDecompteLRGfromNetDern(@RequestParam("numMarche") Long numMarche, @RequestParam("idLot") String idLot, @RequestParam("numPieceFourn") Short numPieceFourn) {
        return decArticleService.getDecArticlesTravauxDecompteLRGfromNetDer(numMarche, idLot, numPieceFourn);
    }

    @RequestMapping(value = "/approDecompteLRG", method = RequestMethod.GET)
    public List<DecArticle> getDecArticlesApproDecompteLRGfromNetDern(@RequestParam("numMarche") Long numMarche, @RequestParam("idLot") String idLot, @RequestParam("numPieceFourn") Short numPieceFourn) {
        return decArticleService.getDecArticlesApproDecompteLRGfromNetDer(numMarche, idLot, numPieceFourn);
    }

    @RequestMapping(value = "/updateTravaux", method = RequestMethod.PATCH)
    public ResponseEntity<List<DecArticle>> patchDecArticlesTravaux(
            @RequestParam Long numMarche,
            @RequestParam String idLot,
            @RequestParam Short numPieceFourn,
            @RequestParam Short numEtape,
            @RequestBody List<DecArticleUpdateRequest> articlesToUpdate) {

        // Appeler le service pour mettre à jour les articles
        List<DecArticle> updatedArticles = decArticleService.patchDecArticlesTravaux(
                numMarche, idLot, numPieceFourn, numEtape, articlesToUpdate);

        return ResponseEntity.ok(updatedArticles);
    }

    @RequestMapping(value = "/updateAppro", method = RequestMethod.PATCH)
    public ResponseEntity<List<DecArticle>> patchDecArticlesAppro(
            @RequestParam Long numMarche,
            @RequestParam String idLot,
            @RequestParam Short numPieceFourn,
            @RequestParam Short numEtape,
            @RequestBody List<DecArticleUpdateRequest> articlesToUpdate) {

        // Appeler le service pour mettre à jour les articles
        List<DecArticle> updatedArticles = decArticleService.patchDecArticlesAppro(
                numMarche, idLot, numPieceFourn, numEtape, articlesToUpdate);

        return ResponseEntity.ok(updatedArticles);
    }

    @RequestMapping(value = "/calculateMontantsFinalDecArticlesOrd/{numMarche}/{numPieceFourn}/{numEtape}", method = RequestMethod.GET)
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


}
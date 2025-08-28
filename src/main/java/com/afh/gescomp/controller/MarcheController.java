package com.afh.gescomp.controller;


import com.afh.gescomp.model.primary.Article;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.payload.response.MontantResponse;
import com.afh.gescomp.repository.primary.MarcheRepository;
import com.afh.gescomp.service.MarcheService;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/marches")
public class MarcheController {

    @Autowired
    public MarcheService marcheService;
    @Autowired
    private MarcheRepository marcheRepository;


    @RequestMapping(value = "all", method = RequestMethod.GET)
    public ResponseEntity<Page<Marche>> getMarches(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,  @RequestParam(required = false) String filter, @RequestParam(required = false) String designation, @RequestParam(required = false) String fournisseurdesignation, @RequestParam(required = false) String numStruct, @RequestParam(required = false) String numFourn) {
        Pageable pageable = new PageRequest(page, size);
        Page<Marche> marches = marcheService.getAllMarches(pageable, filter, designation, fournisseurdesignation, numStruct, numFourn);
        return ResponseEntity.ok(marches);
    }

    @RequestMapping(value = "/allMarches",method = RequestMethod.GET)
    public ResponseEntity<List<Marche>> getMarches(@RequestParam(required = false) String numStruct) {
        List<Marche> marches = marcheService.getAllMarchesNoPaginAndSearch(numStruct);
        return ResponseEntity.ok(marches);
    }

    @RequestMapping(value = "/options", method = RequestMethod.GET)
    public ResponseEntity<Page<Marche>> getMarches(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String numStruct) {

        Pageable pageable = new PageRequest(page, size);

        // Si searchTerm est présent, effectuer une recherche avec pagination
        Page<Marche> marchesPage;
        if (searchTerm != null && !searchTerm.isEmpty()) {
            marchesPage = marcheService.searchMarches(searchTerm, pageable,numStruct);
        } else {
            marchesPage = marcheService.getMarches(pageable,numStruct);
        }

        return ResponseEntity.ok(marchesPage);
    }


    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Marche> getMarcheByNumMarche(@PathVariable("id") Long numMarche) {
        Marche marche = marcheService.findMarcheByNumMarche(numMarche);
        if (marche == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(marche);
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Marche> addArticle( @Valid @RequestBody Marche marcheRequest) {
        marcheService.save(marcheRequest);
        return ResponseEntity.ok(marcheRequest);
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteMarche(@PathVariable("id") Long numMarche) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        Marche marche = marcheService.findMarcheByNumMarche(numMarche);
        if (numMarche == null) {
            map.put("status", 0);
            map.put("message", "Data is not found");
            return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
        }
        try {
            marcheService.deleteMarche(marche);
            map.put("status", 1);
            map.put("message", "Record is deleted successfully!");
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (Exception ex) {
            // En cas d'erreur pendant la suppression, retournez une réponse 500 Internal Server Error
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public ResponseEntity<Marche> updateMarche(@PathVariable Long id, @RequestBody Marche marcheDetails) {
        Marche updatedMarche = marcheService.updateMarche(id, marcheDetails);
        return ResponseEntity.ok(updatedMarche);
    }

    @RequestMapping(value = "/calculateMontants/{numMarche}", method = RequestMethod.GET)
    public ResponseEntity<MontantResponse> calculateMontants(@PathVariable("numMarche") Long numMarche) {
        try {
            // Appeler la méthode du service pour exécuter la procédure SQL et obtenir les résultats
            MontantResponse montantResponse = marcheService.calculateMontants(numMarche);
            return ResponseEntity.ok(montantResponse);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MontantResponse("Erreur calcul"));
        }
    }
    
    /**
     * Récupère tous les marchés d'un fournisseur spécifique
     * @param numFourn Numéro du fournisseur
     * @return Liste des marchés du fournisseur
     */
    @RequestMapping(value = "/fournisseur", method = RequestMethod.GET)
    public ResponseEntity<List<Marche>> getMarchesByFournisseur(@RequestParam String numFourn) {
        try {
            List<Marche> marches = marcheRepository.findByNumFournOrderByIdDesc(numFourn);
            return ResponseEntity.ok(marches);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}

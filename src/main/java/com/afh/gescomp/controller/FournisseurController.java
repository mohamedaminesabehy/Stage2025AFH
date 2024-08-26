package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.service.FournisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/fournisseur")
public class FournisseurController {


    @Autowired
    public FournisseurService fournisseurService;


    @GetMapping
    public ResponseEntity<?> getFournisseurs() {
        Map<String, Object> map = new LinkedHashMap<>();
        List<Fournisseur> fournisseurList = fournisseurService.getFournisseurs();
        return new ResponseEntity<>(fournisseurList, HttpStatus.OK);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveFournisseur(@RequestBody Fournisseur fournisseur) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        fournisseurService.save(fournisseur);
        map.put("status", 1);
        map.put("message", "Record is Saved Successfully!");
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getFournisseurById(@PathVariable Long id) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        try {
            Fournisseur fournisseur = fournisseurService.findById(id);

            if (fournisseur == null) {
                map.put("status", 0);
                map.put("message", "Data is not found");
                return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
            }

            map.put("status", 1);
            map.put("data", fournisseur);
            return new ResponseEntity<>(map, HttpStatus.OK);
            } catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
            }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFournisseur(@PathVariable Long id) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
            Fournisseur fournisseur = fournisseurService.findById(id);
        if (fournisseur == null) {
            // Si le fournisseur n'existe pas, retournez une réponse 404 Not Found
            map.put("status", 0);
            map.put("message", "Data is not found");
            return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
        }
        try {
            // Supprimez le fournisseur
            fournisseurService.delete(fournisseur);
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

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateFournisseurById(@PathVariable Long id, @RequestBody Fournisseur fournisseurDetail) {
        Fournisseur fournisseur = fournisseurService.findById(id);

        if (fournisseur == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("status", 0, "message", "Data is not found"));
        }
        try {
            // Mettez à jour les détails du fournisseur
            fournisseur.setNumFourn(fournisseurDetail.getNumFourn());
            fournisseur.setCodePays(fournisseurDetail.getCodePays());
            fournisseur.setNumGouv(fournisseurDetail.getNumGouv());
            fournisseur.setDesignation(fournisseurDetail.getDesignation());
            fournisseur.setContact(fournisseurDetail.getContact());
            fournisseur.setAdresse(fournisseurDetail.getAdresse());
            fournisseur.setVille(fournisseurDetail.getVille());
            fournisseurService.save(fournisseur);
            return ResponseEntity.ok(Map.of("status", 1, "data", fournisseur));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", 0, "message", "An error occurred while processing the request"));
        }
    }

    @DeleteMapping("/deleteAll")
    public ResponseEntity<?> deleteAllFournisseurs() {
        Map<String, Object> map = new LinkedHashMap<>();
        try {
            fournisseurService.deleteAll();
            map.put("status", 1);
            map.put("message", "All records are deleted successfully!");
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

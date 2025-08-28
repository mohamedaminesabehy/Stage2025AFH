package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.service.FournisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/fournisseur")
public class FournisseurController {


    @Autowired
    public FournisseurService fournisseurService;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<Page<Fournisseur>>getFournisseurs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String fournisseurDesignation,
            @RequestParam(required = false) String designation
    ) {
        Pageable pageable = new PageRequest(page, size);
        Page<Fournisseur> fournisseurs = fournisseurService.getAllFournisseursByNumFourn(pageable,fournisseurDesignation, designation);
        return new ResponseEntity<>(fournisseurs, HttpStatus.OK);
    }

    @RequestMapping(value = "/getFournisseursForSearch", method = RequestMethod.GET)
    public Page<Fournisseur>getFournisseursForSearch(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,@RequestParam(required = false) String filter) {
        Pageable pageable = new PageRequest(page, size);
        if(filter != null && !filter.isEmpty()){
            return fournisseurService.searchFournisseur(new PageRequest(page, size), filter);
        } else {
            return fournisseurService.getFournisseurs(page, size);
        }
    }


    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<?> saveFournisseur(@RequestBody Fournisseur fournisseur) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        fournisseurService.save(fournisseur);
        map.put("status", 1);
        map.put("message", "Record is Saved Successfully!");
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
    public ResponseEntity<Fournisseur> getFournisseurById(@PathVariable Long id) {
        Fournisseur fournisseur = fournisseurService.findById(id);
        if (fournisseur == null) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(fournisseur);
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
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
            fournisseurService.deleteFournisseur(fournisseur);
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

    @RequestMapping(value = "/update/{id}", method = RequestMethod.PUT)
    public ResponseEntity<?> updateFournisseurById(@PathVariable Long id, @RequestBody Fournisseur fournisseurDetail) {
        Fournisseur fournisseur = fournisseurService.findById(id);

        if (fournisseur == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createDataNotFoundResponse());
        }
        try {
            fournisseur.setNumFourn(fournisseurDetail.getNumFourn());
            fournisseur.setCodePays(fournisseurDetail.getCodePays());
            fournisseur.setNumGouv(fournisseurDetail.getNumGouv());
            fournisseur.setDesignation(fournisseurDetail.getDesignation());
            fournisseur.setContact(fournisseurDetail.getContact());
            fournisseur.setAdresse(fournisseurDetail.getAdresse());
            fournisseur.setVille(fournisseurDetail.getVille());
            fournisseur.setCodePostal(fournisseurDetail.getCodePostal());
            fournisseur.setTel(fournisseurDetail.getTel());
            fournisseur.setFax(fournisseurDetail.getFax());
            fournisseur.setEmail(fournisseurDetail.getEmail());
            fournisseur.setWeb(fournisseurDetail.getWeb());
            fournisseur.setStructCap(fournisseurDetail.getStructCap());
            fournisseur.setActivite(fournisseurDetail.getActivite());
            fournisseur.setRcs(fournisseurDetail.getRcs());
            fournisseur.setMatCnss(fournisseurDetail.getMatCnss());
            fournisseur.setDesignationFr(fournisseurDetail.getDesignationFr());
            fournisseur.setMatriculeFisc(fournisseurDetail.getMatriculeFisc());

            fournisseurService.save(fournisseur);
            return ResponseEntity.ok(createResponse(fournisseur));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(create_INTERNAL_SERVER_ERRORResponse());
        }
    }

    private Map<String, Object> createDataNotFoundResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 0);
        response.put("message", "Data is not found");
        return response;
    }
    private Map<String, Object> create_INTERNAL_SERVER_ERRORResponse() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 0);
        response.put("message", "An error occurred while processing the request");
        return response;
    }
    private Map<String, Object> createResponse(Object fournisseur) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 1);
        response.put("data", fournisseur);
        return response;
    }

    /**
     * Endpoint pour générer un PDF avec les détails d'un fournisseur et ses marchés
     * @param numFourn Le numéro du fournisseur
     * @return Le fichier PDF en tant que réponse HTTP
     */
    @RequestMapping(value = "/export/pdf/{numFourn}", method = RequestMethod.GET)
    public ResponseEntity<byte[]> exportFournisseurDetailsToPDF(@PathVariable String numFourn) {
        try {
            byte[] pdfBytes = fournisseurService.generateFournisseurDetailsPDF(numFourn);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(new MediaType("application", "pdf"));
            headers.setContentDispositionFormData("attachment", "fournisseur_" + numFourn + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}



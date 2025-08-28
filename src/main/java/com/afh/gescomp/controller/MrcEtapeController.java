package com.afh.gescomp.controller;

import com.afh.gescomp.dto.MrcEtapeRequest;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.model.primary.MrcEtape;
import com.afh.gescomp.model.primary.MrcEtapeId;
import com.afh.gescomp.service.MarcheService;
import com.afh.gescomp.service.MrcEtapeService;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/MrcEtapes")
public class MrcEtapeController {

    @Autowired
    private MrcEtapeService mrcEtapeService;

    @Autowired
    private MarcheService marcheService;

    @RequestMapping(value = "/marche/{numMarche}", method = RequestMethod.GET)
    public ResponseEntity<List<MrcEtape>> getEtapesForMarche(@PathVariable Long numMarche) {
        List<MrcEtape> etapes = mrcEtapeService.getEtapesForMarche(numMarche);
        return ResponseEntity.ok(etapes);
    }

    @RequestMapping(value = "/marche/{numMarche}/{numEtape}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteEtape(@PathVariable long numMarche, @PathVariable short numEtape) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        MrcEtapeId id = new MrcEtapeId(numMarche, numEtape);
        mrcEtapeService.delete(id);
        map.put("status", 1);
        map.put("message", "Record is deleted successfully!");
        return new ResponseEntity<>(map,HttpStatus.OK); // Retourne un statut 204 No Content
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<List<MrcEtape>> saveOrUpdateEtapes(@Valid @RequestBody MrcEtapeRequest request) {
        // Vérifiez que le marché existe
        Marche marche = marcheService.findMarcheByNumMarche(request.getNumMarche());
        if (marche == null) {
            return ResponseEntity.badRequest().body(null); // ou lancez une exception personnalisée
        }

        List<MrcEtape> savedEtapes = new ArrayList<>();

        for (MrcEtape mrcEtapeRequest : request.getEtapes()) {
            // Vérifiez que l'ID n'est pas null avant d'accéder à ses propriétés
            if (mrcEtapeRequest.getId() == null) {
                return ResponseEntity.badRequest().body(null); // gérer ce cas
            }

            // Cherchez si une étape avec le même identifiant existe
            MrcEtape existingEtape = mrcEtapeService.findById(
                    mrcEtapeRequest.getId().getNumMarche(),
                    mrcEtapeRequest.getId().getNumEtape()
            );

            MrcEtape mrcEtape;

            if (existingEtape != null) {
                // Mettre à jour l'étape existante
                mrcEtape = updateEtape(existingEtape, mrcEtapeRequest);
            } else {
                // Créer une nouvelle étape
                mrcEtape = createEtape(request, mrcEtapeRequest, marche);
            }

            // Enregistrer ou mettre à jour l'étape
            mrcEtapeService.save(mrcEtape);
            savedEtapes.add(mrcEtape);
        }

        return ResponseEntity.ok(savedEtapes);
    }

    private MrcEtape updateEtape(MrcEtape existingEtape, MrcEtape mrcEtapeRequest) {
        existingEtape.setDesignation(mrcEtapeRequest.getDesignation());
        existingEtape.setDureePrev(mrcEtapeRequest.getDureePrev());
        existingEtape.setPctPaiement(mrcEtapeRequest.getPctPaiement());
        return existingEtape;
    }

    private MrcEtape createEtape(MrcEtapeRequest request, MrcEtape mrcEtapeRequest, Marche marche) {
        MrcEtape newEtape = new MrcEtape();
        MrcEtapeId id = new MrcEtapeId();
        id.setNumMarche(request.getNumMarche());
        Short nextNumEtape = mrcEtapeService.getNextNumEtape(request.getNumMarche());
        id.setNumEtape(nextNumEtape);
        newEtape.setId(id);

        newEtape.setNumMarche(marche);
        newEtape.setDesignation(mrcEtapeRequest.getDesignation());
        newEtape.setDureePrev(mrcEtapeRequest.getDureePrev());
        newEtape.setPctPaiement(mrcEtapeRequest.getPctPaiement());

        return newEtape;
    }

}

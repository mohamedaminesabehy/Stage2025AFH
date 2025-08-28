package com.afh.gescomp.controller;


import com.afh.gescomp.model.primary.TypePenalite;
import com.afh.gescomp.service.TypePenaliteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/typepenalite")
public class TypePenaliteController {

    @Autowired
    public TypePenaliteService typePenaliteService;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<?> getTypePenalites() {
        List<TypePenalite> TypePenalitesList = typePenaliteService.findAllByOrderByIdAsc();
        return new ResponseEntity<>(TypePenalitesList, HttpStatus.OK);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<?> saveTypePenalite(@RequestBody TypePenalite typePenalite) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        typePenaliteService.save(typePenalite);
        map.put("status", 1);
        map.put("message", "Record is Saved Successfully!");
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> getTypePenaliteById(@PathVariable Long id) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        try {
            TypePenalite typePenalite = typePenaliteService.findById(id);

            if (typePenalite == null) {
                map.put("status", 0);
                map.put("message", "Data is not found");
                return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
            }

            map.put("status", 1);
            map.put("data", typePenalite);
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteTypePenalite(@PathVariable Long id) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        TypePenalite typePenalite = typePenaliteService.findById(id);
        if (typePenalite == null) {
            map.put("status", 0);
            map.put("message", "Data is not found");
            return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
        }
        try {
            typePenaliteService.deleteTypePenalite(typePenalite);
            map.put("status", 1);
            map.put("message", "Record is deleted successfully!");
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/update/{id}", method = RequestMethod.PUT)
    public ResponseEntity<?> updateTypePenaliteById(@PathVariable Long id, @RequestBody TypePenalite typePenaliteDetails) {
        TypePenalite typePenalite = typePenaliteService.findById(id);

        if (typePenalite == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createDataNotFoundResponse());
        }
        try {
            typePenalite.setDesignation(typePenaliteDetails.getDesignation());
            typePenaliteService.save(typePenalite);
            return ResponseEntity.ok(createResponse(typePenalite));
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
    private Map<String, Object> createResponse(Object typePenalite) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 1);
        response.put("data", typePenalite);
        return response;
    }
}

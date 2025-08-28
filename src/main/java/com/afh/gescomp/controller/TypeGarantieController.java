package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.TypeGarantie;
import com.afh.gescomp.service.TypeGarantieService;
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
@RequestMapping("/api/typegarantie")
public class TypeGarantieController {

    @Autowired
    public TypeGarantieService typeGarantieService;

    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<?> getTypeGaranties() {
        List<TypeGarantie> typeGarantieList = typeGarantieService.findAllByOrderByIdAsc();
        return new ResponseEntity<>(typeGarantieList, HttpStatus.OK);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<?> saveTypeGarantie(@RequestBody TypeGarantie typeGarantie) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        typeGarantieService.save(typeGarantie);
        map.put("status", 1);
        map.put("message", "Record is Saved Successfully!");
        return new ResponseEntity<>(map, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> getTypeGarantieById(@PathVariable Long id) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        try {
            TypeGarantie typeGarantie = typeGarantieService.findById(id);

            if (typeGarantie == null) {
                map.put("status", 0);
                map.put("message", "Data is not found");
                return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
            }

            map.put("status", 1);
            map.put("data", typeGarantie);
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteTypeGarantie(@PathVariable Long id) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        TypeGarantie typeGarantie = typeGarantieService.findById(id);
        if (typeGarantie == null) {
            map.put("status", 0);
            map.put("message", "Data is not found");
            return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
        }
        try {
            typeGarantieService.deleteTypeGarantie(typeGarantie);
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
    public ResponseEntity<?> updateTypeGarantieById(@PathVariable Long id, @RequestBody TypeGarantie typeGarantieDetails) {
        TypeGarantie typeGarantie = typeGarantieService.findById(id);

        if (typeGarantie == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createDataNotFoundResponse());
        }
        try {
            typeGarantie.setDesignation(typeGarantieDetails.getDesignation());
            typeGarantieService.save(typeGarantie);
            return ResponseEntity.ok(createResponse(typeGarantie));
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
    private Map<String, Object> createResponse(Object typeGarantie) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 1);
        response.put("data", typeGarantie);
        return response;
    }
}

package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.Fournisseur;

import java.util.List;

public interface FournisseurService {
    public List<Fournisseur>getFournisseurs();
    public void save(Fournisseur fournisseur);
    public Fournisseur findById(Long id);
    public void delete(Fournisseur fournisseur);
    public void deleteAll();
}

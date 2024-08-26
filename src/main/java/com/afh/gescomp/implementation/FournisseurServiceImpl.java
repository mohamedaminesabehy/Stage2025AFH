package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.repository.primary.FournisseurRepository;
import com.afh.gescomp.service.FournisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FournisseurServiceImpl implements FournisseurService {

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Override
    public List<Fournisseur> getFournisseurs() {
        return fournisseurRepository.findAll();
    }

    @Override
    public void save(Fournisseur fournisseur) {
        fournisseurRepository.save(fournisseur);
    }

    @Override
    public Fournisseur findById(Long     id) {
        return fournisseurRepository.findById(id).get();
    }

    @Override
    public void delete(Fournisseur fournisseur) {
        fournisseurRepository.delete(fournisseur);
    }

    @Override
    public void deleteAll() {
        fournisseurRepository.deleteAll();
    }
}

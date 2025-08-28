package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.Banque;
import com.afh.gescomp.repository.primary.BanqueRepository;
import com.afh.gescomp.service.BanqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class BanqueServiceImpl implements BanqueService {

    @Autowired
    private BanqueRepository banqueRepository;
    @Override
    public List<Banque> getAllBanque() {
        return banqueRepository.findAll();
    }

    @Override
    public Banque getBanqueByNumBanque(Short numBanque) {
        return banqueRepository.findById(numBanque);
    }
}

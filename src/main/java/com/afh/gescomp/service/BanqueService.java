package com.afh.gescomp.service;

import com.afh.gescomp.model.primary.Banque;

import java.util.List;

public interface BanqueService {
    List<Banque>getAllBanque();
    Banque getBanqueByNumBanque(Short numBanque);
}

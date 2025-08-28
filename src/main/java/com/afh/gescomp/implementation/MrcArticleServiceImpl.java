package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.Article;
import com.afh.gescomp.model.primary.MrcArticle;
import com.afh.gescomp.model.primary.MrcArticleId;
import com.afh.gescomp.payload.response.MontantResponse;
import com.afh.gescomp.repository.primary.MrcArticleRepository;
import com.afh.gescomp.service.ArticleService;
import com.afh.gescomp.service.MrcArticleService;

import javax.persistence.EntityManager;
import javax.persistence.EntityNotFoundException;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class MrcArticleServiceImpl implements MrcArticleService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private MrcArticleRepository mrcArticleRepository;

    @Autowired
    private ArticleService articleService;

    @Override
    public void deleteMrcArticle(String numArticle, Long numMarche, Integer ap, String idLot, Short idArticle ) {
        MrcArticleId articleId = new MrcArticleId(numArticle, numMarche, ap, idLot, idArticle);
        if (!mrcArticleRepository.exists(articleId)) {
            throw new EntityNotFoundException("Article not found with id: " + articleId);
        }
        mrcArticleRepository.delete(articleId);
    }

    @Override
    public MrcArticle findById(Long numMarche, String idLot, String numArticle, Short idArticle, Integer ap) {
        return mrcArticleRepository.findById(numMarche, idLot, numArticle, idArticle, ap);
    }

    @Override
    public void save(MrcArticle mrcArticle) {
        mrcArticleRepository.save(mrcArticle);
    }


    @Transactional
    @Override
    public List<MrcArticle> saveOrUpdateArticles(List<MrcArticle> mrcArticles) {
        List<MrcArticle> savedArticles = new ArrayList<>();

        for (MrcArticle mrcArticleRequest : mrcArticles) {
            if (mrcArticleRequest.getId() == null) {
                throw new IllegalArgumentException("Article ID cannot be null");
            }

            MrcArticleId articleId = mrcArticleRequest.getId();
            MrcArticle existingArticle = findById(
                    articleId.getNumMarche(),
                    articleId.getIdLot(),
                    articleId.getNumArticle(),
                    articleId.getIdArticle(),
                    1
            );

            if (existingArticle != null) {
                updateArticle(existingArticle, mrcArticleRequest);
                mrcArticleRepository.save(existingArticle); // Persist changes
                savedArticles.add(existingArticle);
            } else {
                MrcArticle newArticle = createArticle(mrcArticleRequest);
                mrcArticleRepository.save(newArticle);
                savedArticles.add(newArticle);
            }
        }
        return savedArticles;
    }

    @Override
    public MrcArticle findByNumMarcheAndIdLotAndNumArticleAndIdArticle(Long numMarche, String idLot, String numArticle, Short idArticle) {
        return mrcArticleRepository.findByNumMarcheAndIdLotAndNumArticleAndIdArticle(numMarche,idLot,numArticle, idArticle);
    }

    @Override
    public MrcArticle findByNumMarcheAndIdLotAndIdArticle(Long numMarche, String idLot, Short idArticle) {
        return mrcArticleRepository.findByNumMarcheAndIdLotAndIdArticle(numMarche,idLot, idArticle);
    }

    @Override
    public Short getMaxIdArticle(Long numMarche, String idLot) {
        return mrcArticleRepository.findMaxIdArticleByNumMarcheAndIdLot(numMarche, idLot);
    }

    private void updateArticle(MrcArticle existingArticle, MrcArticle mrcArticleRequest) {
        existingArticle.setTva(mrcArticleRequest.getTva());
        existingArticle.setQuantite(mrcArticleRequest.getQuantite());
        existingArticle.setPrixUnitaire(mrcArticleRequest.getPrixUnitaire());
        existingArticle.setIdTypeSerie(mrcArticleRequest.getIdTypeSerie());
        existingArticle.setDescription(mrcArticleRequest.getDescription());
        existingArticle.setCodeArticle(mrcArticleRequest.getCodeArticle());
        existingArticle.getId().setAp(1);
        existingArticle.setChAp(mrcArticleRequest.getChAp());
        if (mrcArticleRequest.getChAp() != null && mrcArticleRequest.getChAp() == 1) {
            if (mrcArticleRequest.getPrixFourniture() == null) {
                throw new IllegalArgumentException("Le champ prixFourniture doit être rempli lorsque chAp est égal à 1.");
            }
            existingArticle.setPrixFourniture(mrcArticleRequest.getPrixFourniture());
        } else {
            existingArticle.setPrixFourniture(null); // Ou 0, selon la logique souhaitée
        }

    }



    private MrcArticle createArticle(MrcArticle mrcArticleRequest) {
        MrcArticle newArticle = new MrcArticle();
        MrcArticleId id = new MrcArticleId();

        // Assigner les valeurs de l'objet request à l'objet newArticle
        id.setNumMarche(mrcArticleRequest.getId().getNumMarche());
        id.setIdLot(mrcArticleRequest.getMrcLot().getId().getIdLot());
        id.setIdArticle(mrcArticleRequest.getId().getIdArticle());
        id.setNumArticle(mrcArticleRequest.getNumArticle().getNumArticle());
        id.setAp(1); // Ou selon votre logique
        newArticle.setId(id);

        // Récupérer l'article par numéro d'article
        Article article = articleService.findArticleByNumArticle(id.getNumArticle());
        newArticle.setNumArticle(article);

        // Assigner les autres propriétés
        newArticle.setMrcLot(mrcArticleRequest.getMrcLot());
        newArticle.setTva(mrcArticleRequest.getTva());
        newArticle.setQuantite(mrcArticleRequest.getQuantite());
        newArticle.setPrixUnitaire(mrcArticleRequest.getPrixUnitaire());
        newArticle.setIdTypeSerie(mrcArticleRequest.getIdTypeSerie());
        newArticle.setDescription(mrcArticleRequest.getDescription());
        newArticle.setCodeArticle(mrcArticleRequest.getCodeArticle());
        // Vérifier le champ chAp
        if (mrcArticleRequest.getChAp() != null && mrcArticleRequest.getChAp() == 1) {
            if (mrcArticleRequest.getPrixFourniture() == null) {
                throw new IllegalArgumentException("Le champ prixFourniture doit être rempli lorsque chAp est égal à 1.");
            }
            newArticle.setPrixFourniture(mrcArticleRequest.getPrixFourniture());
        } else {
            newArticle.setPrixFourniture(null); // Ou 0, selon la logique souhaitée
        }

        newArticle.setChAp(mrcArticleRequest.getChAp());
        return newArticle;
    }


    @Override
    public List<MrcArticle> findByNumMarcheAndIdLot(Long numMarche, String idLot) {
        return mrcArticleRepository.findByNumMarcheAndIdLot(numMarche, idLot);
    }

    @Override
    public Page<MrcArticle> findByNumMarcheAndIdLot(Long numMarche, String idLot, Pageable pageable) {
        return mrcArticleRepository.findByNumMarcheAndIdLot(numMarche, idLot, pageable);
    }

}

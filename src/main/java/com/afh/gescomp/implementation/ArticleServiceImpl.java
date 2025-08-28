package com.afh.gescomp.implementation;

import com.afh.gescomp.dto.ArticleDTO;
import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.repository.primary.*;
import com.afh.gescomp.service.ArticleService;
import javax.persistence.*;
import org.springframework.cache.annotation.Cacheable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.TimeZone;


@Service
public class ArticleServiceImpl implements ArticleService {


    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private SecteurRepository secteurRepository;
    @Autowired
    private SousSecteurRepository sousSecteurRepository;
    @Autowired
    private FamilleRepository familleRepository;
    @Autowired
    private SousFamilleRepository sousFamilleRepository;

    @Transactional
    @Override
    public void save(Article article) {
        if (article.getCreatedAt() == null) {
            Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
            article.setCreatedAt(new java.sql.Timestamp(calendar.getTimeInMillis()));
        }
        String sect = String.format("%02d", article.getNumSectEco());
        String sSect = String.format("%02d", article.getNumSSectEco());
        String famille = String.format("%03d", article.getNumFamille());
        String sFamille = String.format("%04d", article.getNumSFamille());
        String nextNumArticle = getArticleSuivant(sect, sSect, famille, sFamille);
        article.setNumArticle(nextNumArticle);
        articleRepository.save(article);
    }

    @Transactional
    @Override
    public String getArticleSuivant(String sect, String sSect, String famille, String sFamille) {
        String result = "";
        String sql = "SELECT PKG_GENERAL.GET_ARTICLE_SUIVANT(:sect, :sSect, :famille, :sFamille) FROM dual";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("sect", sect);
        query.setParameter("sSect", sSect);
        query.setParameter("famille", famille);
        query.setParameter("sFamille", sFamille);
        return result = (String) query.getSingleResult();
    }

    @Override
    public Page<Article> getAllArticlesForSearchingByFilter(Pageable pageable, String searchTerm) {
        Pageable sortedPageable = new PageRequest(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );
        if (searchTerm != null && !searchTerm.isEmpty()) {
            return articleRepository.findByNumArticleContainingIgnoreCaseOrDesignationFrContainingIgnoreCase(sortedPageable, searchTerm);
        }
        // Cas 4: Aucun filtre fourni
        return articleRepository.findAllArticlesWithCustomSorting(pageable);
    }

    @Override
    public List<Article> getAllArticlesNoPaginAndSearch() {
        return articleRepository.findAll();
    }

    @Override
    public List<Article> getNumArticles(int page, int size) {
        Pageable pageable = new PageRequest(page, size);
        Page<Article> articlePage = articleRepository.findAll(pageable);
        return articlePage.getContent();
    }

    @Override
    public Article getArticleById(String numArticle) {
        return articleRepository.findOne(numArticle);
    }

    @Override
    public List<Article> searchArticle(String searchTerm) {
        return articleRepository.findByDesignationFrContainingIgnoreCase(searchTerm);
    }


    @Override
    public Article findArticleByNumArticle(String numArticle) {
        return articleRepository.findOne(numArticle);
    }

    @Override
    public void deleteArticle(Article article) {
        articleRepository.delete(article);
    }

    @Transactional
    @Override
    public Article updateArticle(String existingNumArticle, Article article) {
        Article existingArticle=articleRepository.findOne(existingNumArticle);

        existingArticle.setLibUnite(article.getLibUnite());
        existingArticle.setDesignation(article.getDesignation());
        existingArticle.setDesignationFr(article.getDesignationFr());
        existingArticle.setHistorique(article.getHistorique());
        existingArticle.setTVA(article.getTVA());
        return  articleRepository.save(existingArticle);
    }

    @Override
    public List<Article> findAllArticles() {
        return articleRepository.findAll();
    }

/*    @Transactional
    @Cacheable("articles")
    @Override
    public Page<ArticleDTO> getAllArticles(Pageable pageable, String filter, String secteurDesignation, String ssecteurDesignation, String familleDesigantion, String ssFamilleDesignation, String designationFr) {
        Pageable sortedPageable = new PageRequest(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );

        Page<Article> articles;

        // Conditions de filtrage
        if ((filter == null || filter.isEmpty())  && (designationFr == null || designationFr.isEmpty()) && (secteurDesignation == null || secteurDesignation.isEmpty())) {
            // Aucun filtre appliqué
            articles = articleRepository.findAllArticlesWithCustomSorting(sortedPageable);
        }
        else {
            // Filtre uniquement
            articles = articleRepository.searchByFilter(sortedPageable, filter);
        }

        return articles.map(this::convertToDTO);
    }*/

    @Transactional
    @Cacheable("articles")
    @Override
    public Page<ArticleDTO> getAllArticles(
            Pageable pageable,
            String filter,
            String secteurDesignation,
            String ssecteurDesignation,
            String familleDesignation,
            String ssFamilleDesignation,
            String designationFr) {

        Pageable sortedPageable = new PageRequest(
                pageable.getPageNumber(),
                pageable.getPageSize()
        );
        Page<Article> articles;

        if (isNoFilterApplied(filter, secteurDesignation, ssecteurDesignation, familleDesignation, ssFamilleDesignation, designationFr)) {
            articles = articleRepository.findAllArticlesWithCustomSorting(sortedPageable);
        } else {
            // Si des filtres sont appliqués, utiliser une méthode de filtrage avec tri
            articles = articleRepository.findAllArticlesWithFiltersAndSorting(
                    filter,
                    secteurDesignation,
                    ssecteurDesignation,
                    familleDesignation,
                    ssFamilleDesignation,
                    designationFr,
                    sortedPageable
            );
        }
        List<ArticleDTO> articleDTOs = new ArrayList<>();
        for (Article article : articles) {
            articleDTOs.add(convertToDTO(article)); // Conversion d'un Article en ArticleDTO
        }
        return new PageImpl<>(articleDTOs, pageable, articles.getTotalElements());
        // return articles.map(this::convertToDTO);
    }

    private ArticleDTO convertToDTO(Article article) {
        ArticleDTO dto = new ArticleDTO();
        dto.setNumArticle(article.getNumArticle());
        dto.setLibUnite(article.getLibUnite());
        dto.setDesignation(article.getDesignation());
        dto.setDesignationFr(article.getDesignationFr());
        dto.setHistorique(article.getHistorique());
        dto.setTVA(article.getTVA());
        dto.setCreatedAt(article.getCreatedAt());
        // Ajout des données supplémentaires
        // Enrichir les données supplémentaires
        String sectEcoDesignation = secteurRepository.findDesignationByNumSectEco(article.getNumSectEco());
        dto.setNumSectEco(sectEcoDesignation != null ? sectEcoDesignation : "Unknown");

        String sousSecteurDesignation = sousSecteurRepository.findDesignationByNumSSectEco(article.getNumSSectEco(),article.getNumSectEco());
        dto.setNumSSectEco(sousSecteurDesignation != null ? sousSecteurDesignation : "Unknown");

        String familleDesignation = familleRepository.findDesignationByNumFamille(article.getNumFamille(),article.getNumSSectEco(),article.getNumSectEco());
        dto.setNumFamille(familleDesignation != null ? familleDesignation : "Unknown");

        String sousFamilleDesignation = sousFamilleRepository.findDesignationByNumSFamille(article.getNumSFamille(),article.getNumFamille(),article.getNumSSectEco(),article.getNumSectEco());
        dto.setNumSFamille(sousFamilleDesignation != null ? sousFamilleDesignation : "Unknown");


        return dto;
    }

    private boolean isNoFilterApplied(String filter, String secteurDesignation, String ssecteurDesignation,
                                      String familleDesignation, String ssFamilleDesignation, String designationFr) {
        return (filter == null || filter.isEmpty()) &&
                (secteurDesignation == null || secteurDesignation.isEmpty()) &&
                (ssecteurDesignation == null || ssecteurDesignation.isEmpty()) &&
                (familleDesignation == null || familleDesignation.isEmpty()) &&
                (ssFamilleDesignation == null || ssFamilleDesignation.isEmpty()) &&
                (designationFr == null || designationFr.isEmpty());
    }

}

package com.afh.gescomp.service;


import com.afh.gescomp.dto.ArticleDTO;
import com.afh.gescomp.model.primary.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;

public interface ArticleService {
    void save(Article article);
    Article findArticleByNumArticle(String numArticle);
    void deleteArticle(Article article);
    Article updateArticle(String existingNumArticle, Article article);
    List<Article>findAllArticles();
    Page<ArticleDTO> getAllArticles(Pageable Pageable, String filter, String secteurDesignation, String ssecteurDesignation, String familleDesignation, String ssFamilleDesignation, String designationFr);
    String getArticleSuivant(String sect, String sSect, String famille, String sFamille);
    Page<Article> getAllArticlesForSearchingByFilter(Pageable pageable, String searchTerm);
    List<Article> getAllArticlesNoPaginAndSearch();
    List<Article> getNumArticles(int page, int size);
    Article getArticleById(String numArticle);
    List<Article> searchArticle(String searchTerm);
}

package com.afh.gescomp.controller;

import com.afh.gescomp.dto.ArticleDTO;
import com.afh.gescomp.model.primary.Article;
import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.repository.primary.ArticleRepository;
import com.afh.gescomp.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    public ArticleService articleService;

    @Autowired
    public ArticleRepository articleRepository;

    @RequestMapping(value = "/all", method = RequestMethod.GET)
    public ResponseEntity<Page<ArticleDTO>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) String secteurDesignation,
            @RequestParam(required = false) String ssecteurDesignation,
            @RequestParam(required = false) String familleDesignation,
            @RequestParam(required = false) String ssFamilleDesignation,
            @RequestParam(required = false) String designationFr
    ) {
        Pageable pageable = new PageRequest(page, size);
        Page<ArticleDTO> articles = articleService.getAllArticles(pageable, filter, secteurDesignation, ssecteurDesignation, familleDesignation, ssFamilleDesignation, designationFr);
        return ResponseEntity.ok(articles);
    }

    @RequestMapping(value = "/all/search", method = RequestMethod.GET)
    public ResponseEntity<Page<Article>>getAllArticlesForSearching(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(required = false) String searchTerm) {
        Pageable pageable = new PageRequest(page, size);
        Page<Article> article = articleService.getAllArticlesForSearchingByFilter(pageable,searchTerm);
        return new ResponseEntity<>(article, HttpStatus.OK);
    }


    @RequestMapping(method = RequestMethod.GET)
    public ResponseEntity<List<Article>> getArticles() {
        List<Article> articles = articleService.getAllArticlesNoPaginAndSearch();
        return ResponseEntity.ok(articles);
    }

    @RequestMapping(value = "/options", method = RequestMethod.GET)
    public List<Article> getNumArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchTerm) {
        Pageable pageable = new PageRequest(page, size);
        if(searchTerm != null && !searchTerm.isEmpty()){
            return articleService.searchArticle(searchTerm);
        } else {
            return articleService.getNumArticles(page, size);
        }
    }


    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Article> getNumArticleById(@PathVariable("id") String numArticle) {
        Article article = articleService.getArticleById(numArticle);
        if (article == null) {
            return ResponseEntity.ok(null);
        } else {
            return ResponseEntity.ok(article);
        }
    }


    @RequestMapping(value = "/pagination", method = RequestMethod.GET)
    public Page<Article> getArticles(@RequestParam int page, @RequestParam int size) {
        PageRequest pageRequest = new PageRequest(page, size);
        return articleRepository.findAll(pageRequest);
    }


    @RequestMapping(value = "/scroll/moreArticles", method = RequestMethod.GET)
    public List<Article> getMoreArticlesForPagination(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = new PageRequest(offset / limit, limit);
        return articleRepository.findAll(pageable).getContent();
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Article> addArticle(@RequestBody Article articleRequest) {
        articleService.save(articleRequest);
        return ResponseEntity.ok(articleRequest);
    }

    @RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
    public ResponseEntity<?> getArticleByNumArticle(@PathVariable("id") String numArticle) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        try {
            Article article = articleService.findArticleByNumArticle(numArticle);

            if (article == null) {
                map.put("status", 0);
                map.put("message", "Data is not found");
                return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
            }

            map.put("status", 1);
            map.put("data", article);
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public ResponseEntity<?> deleteArticle(@PathVariable("id") String numArticle) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        Article article = articleService.findArticleByNumArticle(numArticle);
        if (article == null) {
            // Si le fournisseur n'existe pas, retournez une réponse 404 Not Found
            map.put("status", 0);
            map.put("message", "Data is not found");
            return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
        }
        try {
            // Supprimez le fournisseur
            articleService.deleteArticle(article);
            map.put("status", 1);
            map.put("message", "Record is deleted successfully!");
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (Exception ex) {
            // En cas d'erreur pendant la suppression, retournez une réponse 500 Internal Server Error
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/update/{id}", method = RequestMethod.PUT)
    public ResponseEntity<?> updateArticleByNumArticle(@PathVariable("id") String numArticle, @RequestBody Article article) {
        try {
            Article updatedArticle = articleService.updateArticle(numArticle,article);
            return ResponseEntity.ok(createResponse(updatedArticle));
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
    private Map<String, Object> createResponse(Object updatedArticle) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 1);
        response.put("data", updatedArticle);
        return response;
    }




}

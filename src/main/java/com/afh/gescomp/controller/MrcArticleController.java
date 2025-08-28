package com.afh.gescomp.controller;

import com.afh.gescomp.dto.MrcArticleDTO;
import com.afh.gescomp.dto.MrcArticleIdDTO;
import com.afh.gescomp.dto.NumArticleDTO;
import com.afh.gescomp.model.primary.*;
import com.afh.gescomp.service.MrcArticleService;
import javax.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/MrcArticles")
public class MrcArticleController {

    @Autowired
    private MrcArticleService mrcArticleService;



    @RequestMapping(method = RequestMethod.GET)
    public List<MrcArticleDTO> getMrcArticles(
            @RequestParam Long numMarche,
            @RequestParam String idLot) {
        List<MrcArticle> articles = mrcArticleService.findByNumMarcheAndIdLot(numMarche, idLot);
        List<MrcArticleDTO> dtos = new ArrayList<>();
        for (MrcArticle article : articles) {
            MrcArticleDTO dto = new MrcArticleDTO();
            MrcArticleIdDTO idDTO = new MrcArticleIdDTO();
            idDTO.setIdArticle(article.getId().getIdArticle());
            idDTO.setAp(article.getId().getAp());
            idDTO.setIdLot(article.getId().getIdLot());
            idDTO.setNumMarche(article.getId().getNumMarche());
            dto.setId(idDTO);  // Ajout de l'ID au DTO

            // Mappage du numéro d'article
            if (article.getNumArticle() != null) {
                // Créez un objet pour numArticle avec la structure attendue
                NumArticleDTO numArticleDTO = new NumArticleDTO();
                numArticleDTO.setNumArticle(article.getNumArticle().getNumArticle());
                numArticleDTO.setDesignation(article.getNumArticle().getDesignation());
                numArticleDTO.setDesignationFr(article.getNumArticle().getDesignationFr());
                dto.setNumArticle(numArticleDTO);  // Set l'objet NumArticleDTO dans le DTO
            }
            if (article.getMrcLot() != null) {
                MrcLot mrcLot = new MrcLot();
                mrcLot.setId(article.getMrcLot().getId());
                mrcLot.setNumMarche(article.getMrcLot().getNumMarche());
                dto.setMrcLot(mrcLot);  // Ajout de MrcLotDTO
            } else {
                dto.setMrcLot(null);  // Gérer le cas null si nécessaire
            }
            dto.setTva(article.getTva());
            dto.setQuantite(article.getQuantite());
            dto.setPrixUnitaire(article.getPrixUnitaire());
            dto.setChAp(article.getChAp());
            dto.setDescription(article.getDescription());
            dto.setCodeArticle(article.getCodeArticle());
            dto.setQteExte(article.getQteExte());
            dto.setFlagRapport(article.getFlagRapport());
            dto.setPrixFourniture(article.getPrixFourniture());

            // Pour idTypeSerie, vérifiez si c'est nul ou s'il faut retourner un ID spécifique
            if (article.getIdTypeSerie() != null) {
                PrmTypeSerie prmTypeSerie = new PrmTypeSerie();
                prmTypeSerie.setId(article.getIdTypeSerie().getId());
                prmTypeSerie.setDesignation(article.getIdTypeSerie().getDesignation());
                dto.setIdTypeSerie(prmTypeSerie); // ou d'autres informations de TypeSerie
            } else {
                dto.setIdTypeSerie(null);  // Assurez-vous de gérer le null explicitement
            }

            dtos.add(dto);
        }
        return dtos;
    }



    @RequestMapping(value = "/getArticlesForProd",method = RequestMethod.GET)
    @ResponseBody
    public Page<MrcArticleDTO> getMrcArticlesForProd(
            @RequestParam Long numMarche,
            @RequestParam String idLot,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = new PageRequest(page, size);
        Page<MrcArticle> articlesPage = mrcArticleService.findByNumMarcheAndIdLot(numMarche, idLot, pageable);

        List<MrcArticleDTO> dtoList = new ArrayList<MrcArticleDTO>();
        for (MrcArticle article : articlesPage.getContent()) {
            MrcArticleDTO dto = new MrcArticleDTO();
            MrcArticleIdDTO idDTO = new MrcArticleIdDTO();
            idDTO.setIdArticle(article.getId().getIdArticle());
            idDTO.setAp(article.getId().getAp());
            idDTO.setIdLot(article.getId().getIdLot());
            idDTO.setNumMarche(article.getId().getNumMarche());
            dto.setId(idDTO);

            if (article.getNumArticle() != null) {
                NumArticleDTO numArticleDTO = new NumArticleDTO();
                numArticleDTO.setNumArticle(article.getNumArticle().getNumArticle());
                numArticleDTO.setDesignation(article.getNumArticle().getDesignation());
                numArticleDTO.setDesignationFr(article.getNumArticle().getDesignationFr());
                dto.setNumArticle(numArticleDTO);
            }

            if (article.getMrcLot() != null) {
                MrcLot mrcLot = new MrcLot();
                mrcLot.setId(article.getMrcLot().getId());
                mrcLot.setNumMarche(article.getMrcLot().getNumMarche());
                dto.setMrcLot(mrcLot);
            } else {
                dto.setMrcLot(null);
            }

            dto.setTva(article.getTva());
            dto.setQuantite(article.getQuantite());
            dto.setPrixUnitaire(article.getPrixUnitaire());
            dto.setChAp(article.getChAp());
            dto.setDescription(article.getDescription());
            dto.setCodeArticle(article.getCodeArticle());
            dto.setQteExte(article.getQteExte());
            dto.setFlagRapport(article.getFlagRapport());
            dto.setPrixFourniture(article.getPrixFourniture());

            if (article.getIdTypeSerie() != null) {
                PrmTypeSerie prmTypeSerie = new PrmTypeSerie();
                prmTypeSerie.setId(article.getIdTypeSerie().getId());
                prmTypeSerie.setDesignation(article.getIdTypeSerie().getDesignation());
                dto.setIdTypeSerie(prmTypeSerie);
            } else {
                dto.setIdTypeSerie(null);
            }

            dtoList.add(dto);
        }

        return new PageImpl<>(dtoList, pageable, articlesPage.getTotalElements());
    }


    @RequestMapping(value = "/getArticlebyNumArticle", method = RequestMethod.GET)
    public ResponseEntity<MrcArticle> getMrcArticles(
            @RequestParam Long numMarche,
            @RequestParam String idLot,
            @RequestParam String numArticle,
            @RequestParam Short idArticle) {
        MrcArticle article = mrcArticleService.findByNumMarcheAndIdLotAndNumArticleAndIdArticle(numMarche, idLot, numArticle,idArticle);
        return ResponseEntity.ok(article);
    }


    @RequestMapping(value = "/getArticleForExpansion", method = RequestMethod.GET)
    public ResponseEntity<MrcArticle> getMrcArticlesForExpansion(
            @RequestParam Long numMarche,
            @RequestParam String idLot,
            @RequestParam Short idArticle) {
        MrcArticle article = mrcArticleService.findByNumMarcheAndIdLotAndIdArticle(numMarche, idLot,idArticle);
        return ResponseEntity.ok(article);
    }

    @RequestMapping(value = "/{numArticle}/{numMarche}/{ap}/{idLot}/{idArticle}", method = RequestMethod.DELETE)
    public ResponseEntity<Map<String, Object>> deleteMrcArticle(
            @PathVariable String numArticle,
            @PathVariable Long numMarche,
            @PathVariable Integer ap,
            @PathVariable String idLot,
            @PathVariable Short idArticle) {

        Map<String, Object> map = new HashMap<>();
        try {
            mrcArticleService.deleteMrcArticle(numArticle, numMarche, ap, idLot, idArticle);
            map.put("status", 1);
            map.put("message", "Record is deleted successfully!");
            return new ResponseEntity<>(map, HttpStatus.OK);
        } catch (EntityNotFoundException ex) {
            map.put("status", 0);
            map.put("message", "Article not found: " + ex.getMessage());
            return new ResponseEntity<>(map, HttpStatus.NOT_FOUND);
        }catch (Exception ex) {
            map.put("status", 0);
            map.put("message", "An error occurred while processing the request");
            return new ResponseEntity<>(map, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<List<MrcArticle>> saveOrUpdateArticles(@RequestBody List<MrcArticle> mrcArticles) {
        List<MrcArticle> savedArticles;
        savedArticles = mrcArticleService.saveOrUpdateArticles(mrcArticles);
        return ResponseEntity.ok(savedArticles);
    }

    @RequestMapping(value = "/maxIdArticle/{numMarche}/{idLot}",method = RequestMethod.GET)
    public Short getMaxIdArticle(@PathVariable Long numMarche, @PathVariable String idLot) {
        return   mrcArticleService.getMaxIdArticle(numMarche, idLot);
    }
}

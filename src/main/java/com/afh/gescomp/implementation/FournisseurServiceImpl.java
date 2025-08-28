package com.afh.gescomp.implementation;

import com.afh.gescomp.model.primary.Fournisseur;
import com.afh.gescomp.model.primary.Marche;
import com.afh.gescomp.repository.primary.FournisseurRepository;
import com.afh.gescomp.service.FournisseurService;
import com.afh.gescomp.service.MarcheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.io.ByteArrayOutputStream;
import org.springframework.core.io.ClassPathResource;
import org.apache.commons.io.IOUtils;

@Service
public class FournisseurServiceImpl implements FournisseurService {
    
    @Autowired
    private MarcheService marcheService;
    
    @Override
    public byte[] generateFournisseurDetailsPDF(String numFourn) {
        try {
            // Récupérer le fournisseur
            Pageable pageable = new PageRequest(0, 1);
            Page<Fournisseur> page = fournisseurRepository.findByNumFourn(pageable, numFourn);
            Fournisseur fournisseur = page.hasContent() ? page.getContent().get(0) : null;
            if (fournisseur == null) {
                throw new RuntimeException("Fournisseur non trouvé avec le numéro: " + numFourn);
            }
            
            // Récupérer les marchés du fournisseur
            List<Marche> marches = marcheService.getMarchesByFournisseur(numFourn);
            
            // Créer le document PDF
            com.itextpdf.text.Document document = new com.itextpdf.text.Document();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            com.itextpdf.text.pdf.PdfWriter writer = com.itextpdf.text.pdf.PdfWriter.getInstance(document, baos);
            
            // Ajouter un événement de pied de page pour la pagination
            writer.setPageEvent(new FooterPageEvent());
            
            document.open();
            
            // Ajouter le logo AFH
            try {
                ClassPathResource resource = new ClassPathResource("static/assets/afhlogo.jpg");
                byte[] imageData = org.apache.commons.io.IOUtils.toByteArray(resource.getInputStream());
                com.itextpdf.text.Image logo = com.itextpdf.text.Image.getInstance(imageData);
                logo.scaleToFit(100, 100);
                logo.setAlignment(com.itextpdf.text.Element.ALIGN_LEFT);
                document.add(logo);
            } catch (Exception e) {
                // Logo non trouvé, continuer sans logo
                System.err.println("Logo non trouvé: " + e.getMessage());
            }
            
            // Titre principal
            com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD, new com.itextpdf.text.BaseColor(59, 89, 152));
            com.itextpdf.text.Paragraph title = new com.itextpdf.text.Paragraph("Détails du Fournisseur", titleFont);
            title.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
            title.setSpacingBefore(10);
            title.setSpacingAfter(10);
            document.add(title);
            
            // Date du rapport
            com.itextpdf.text.Font normalFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 12);
            com.itextpdf.text.Paragraph dateParagraph = new com.itextpdf.text.Paragraph("Date: " + new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new java.util.Date()), normalFont);
            dateParagraph.setAlignment(com.itextpdf.text.Element.ALIGN_RIGHT);
            document.add(dateParagraph);
            document.add(new com.itextpdf.text.Paragraph(" "));
            
            // Informations du fournisseur
            com.itextpdf.text.Font subTitleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 16, com.itextpdf.text.Font.BOLD);
            com.itextpdf.text.Paragraph fournInfo = new com.itextpdf.text.Paragraph(fournisseur.getDesignation(), subTitleFont);
            document.add(fournInfo);
            
            com.itextpdf.text.Font infoFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 12);
            document.add(new com.itextpdf.text.Paragraph("Numéro: " + fournisseur.getNumFourn(), infoFont));
            
            if (fournisseur.getMatriculeFisc() != null && !fournisseur.getMatriculeFisc().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Matricule Fiscal: " + fournisseur.getMatriculeFisc(), infoFont));
            }
            
            if (fournisseur.getMatCnss() != null && !fournisseur.getMatCnss().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Matricule CNSS: " + fournisseur.getMatCnss(), infoFont));
            }
            
            document.add(new com.itextpdf.text.Paragraph(" "));
            
            // Tableau des marchés
            com.itextpdf.text.Paragraph marcheTitle = new com.itextpdf.text.Paragraph("Liste des Marchés", subTitleFont);
            marcheTitle.setSpacingBefore(10);
            document.add(marcheTitle);
            
            if (marches != null && !marches.isEmpty()) {
                com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(5); // 5 colonnes
                table.setWidthPercentage(100);
                table.setSpacingBefore(10f);
                table.setSpacingAfter(10f);
                
                // Définir les largeurs relatives des colonnes
                float[] columnWidths = {3f, 1.5f, 1.5f, 1.5f, 1.5f};
                table.setWidths(columnWidths);
                
                // En-têtes de colonnes
                com.itextpdf.text.Font headerFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 12, com.itextpdf.text.Font.BOLD, new com.itextpdf.text.BaseColor(255, 255, 255));
                
                com.itextpdf.text.pdf.PdfPCell cell1 = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Désignation", headerFont));
                cell1.setBackgroundColor(new com.itextpdf.text.BaseColor(41, 128, 185));
                cell1.setPadding(5);
                table.addCell(cell1);
                
                com.itextpdf.text.pdf.PdfPCell cell2 = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Numéro", headerFont));
                cell2.setBackgroundColor(new com.itextpdf.text.BaseColor(41, 128, 185));
                cell2.setPadding(5);
                table.addCell(cell2);
                
                com.itextpdf.text.pdf.PdfPCell cell3 = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Date", headerFont));
                cell3.setBackgroundColor(new com.itextpdf.text.BaseColor(41, 128, 185));
                cell3.setPadding(5);
                table.addCell(cell3);
                
                com.itextpdf.text.pdf.PdfPCell cell4 = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Montant (TND)", headerFont));
                cell4.setBackgroundColor(new com.itextpdf.text.BaseColor(41, 128, 185));
                cell4.setPadding(5);
                table.addCell(cell4);
                
                com.itextpdf.text.pdf.PdfPCell cell5 = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase("Statut", headerFont));
                cell5.setBackgroundColor(new com.itextpdf.text.BaseColor(41, 128, 185));
                cell5.setPadding(5);
                table.addCell(cell5);
                
                // Données des marchés
                com.itextpdf.text.Font cellFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10);
                boolean alternate = false;
                
                for (Marche marche : marches) {
                    com.itextpdf.text.pdf.PdfPCell dataCell;
                    com.itextpdf.text.BaseColor backgroundColor = alternate ? 
                            new com.itextpdf.text.BaseColor(240, 240, 240) : 
                            new com.itextpdf.text.BaseColor(255, 255, 255);
                    
                    // Désignation
                    dataCell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(
                            marche.getDesignation() != null ? marche.getDesignation() : "Sans titre", cellFont));
                    dataCell.setBackgroundColor(backgroundColor);
                    dataCell.setPadding(5);
                    table.addCell(dataCell);
                    
                    // Numéro
                    dataCell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(
                            marche.getId() != null ? marche.getId().toString() : "Non disponible", cellFont));
                    dataCell.setBackgroundColor(backgroundColor);
                    dataCell.setPadding(5);
                    table.addCell(dataCell);
                    
                    // Date
                    String formattedDate = marche.getDateMarche() != null ? 
                            new java.text.SimpleDateFormat("dd/MM/yyyy").format(marche.getDateMarche()) : 
                            "Non disponible";
                    dataCell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(formattedDate, cellFont));
                    dataCell.setBackgroundColor(backgroundColor);
                    dataCell.setPadding(5);
                    table.addCell(dataCell);
                    
                    // Montant
                    String formattedMontant = marche.getMontantPenJ() != null ? 
                            String.format("% ,.2f", marche.getMontantPenJ()) : 
                            "Non disponible";
                    dataCell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(formattedMontant, cellFont));
                    dataCell.setBackgroundColor(backgroundColor);
                    dataCell.setPadding(5);
                    table.addCell(dataCell);
                    
                    // Statut
                    dataCell = new com.itextpdf.text.pdf.PdfPCell(new com.itextpdf.text.Phrase(
                            marche.getNant() != null ? marche.getNant().toString() : "Non défini", cellFont));
                    dataCell.setBackgroundColor(backgroundColor);
                    dataCell.setPadding(5);
                    table.addCell(dataCell);
                    
                    alternate = !alternate; // Alterner les couleurs de fond
                }
                
                document.add(table);
            } else {
                document.add(new com.itextpdf.text.Paragraph("Aucun marché trouvé pour ce fournisseur.", 
                        new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 11, com.itextpdf.text.Font.ITALIC)));
            }
            
            document.close();
            return baos.toByteArray();
            
        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = "Erreur lors de la génération du PDF: " + e.getMessage();
            return errorMessage.getBytes();
        }
    }
    
    /**
     * Classe pour gérer le pied de page du PDF avec pagination
     */
    private class FooterPageEvent extends com.itextpdf.text.pdf.PdfPageEventHelper {
        com.itextpdf.text.Font font = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 8, com.itextpdf.text.Font.NORMAL);
        
        @Override
        public void onEndPage(com.itextpdf.text.pdf.PdfWriter writer, com.itextpdf.text.Document document) {
            com.itextpdf.text.Rectangle rect = writer.getPageSize();
            com.itextpdf.text.Phrase footer = new com.itextpdf.text.Phrase("Page " + writer.getPageNumber(), font);
            
            com.itextpdf.text.pdf.ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    com.itextpdf.text.Element.ALIGN_CENTER, 
                    footer, 
                    (rect.getLeft() + rect.getRight()) / 2, 
                    rect.getBottom() + 15, 
                    0
            );
        }
    }

    @Autowired
    private FournisseurRepository fournisseurRepository;
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<Fournisseur> findAllByOrderByIdDesc() {
        return fournisseurRepository.findAllByOrderByIdDesc();
    }

    @Override
    public Page<Fournisseur> getAllFournisseurs(Pageable pageable) {
        Pageable sortedPageable = new PageRequest(
                pageable.getPageNumber(),   // Numéro de la page
                pageable.getPageSize()      // Taille de la page
                // Pas de tri spécifié
        );
        Page<Fournisseur> fournisseurs;
        fournisseurs = fournisseurRepository.findAllFournisseursWithCustomSorting(sortedPageable);
        return fournisseurs;
    }

    @Override
    public Page<Fournisseur> getAllFournisseursByNumFourn(Pageable pageable, String fournisseurDesignation, String designation) {
        Pageable sortedPageable = new PageRequest(
                pageable.getPageNumber(),   // Numéro de la page
                pageable.getPageSize()      // Taille de la page
                // Pas de tri spécifié
        );
/*        if((fournisseurDesignation == null || fournisseurDesignation.isEmpty()) || (designation == null || designation.isEmpty())){
            return  fournisseurRepository.findAllFournisseursWithCustomSorting(pageable);
        }
        return  fournisseurRepository.findAllArticlesWithFilters(fournisseurDesignation, designation, sortedPageable);*/
        if (isNoFilterApplied(fournisseurDesignation,designation)){
            return  fournisseurRepository.findAllFournisseursWithCustomSorting(pageable);
        }else {
            return  fournisseurRepository.findAllArticlesWithFilters(fournisseurDesignation, designation, sortedPageable);
        }

    }

    @Override
    public Page<Fournisseur> searchFournisseur(Pageable pageable, String filter) {
        return fournisseurRepository.findByDesignationFrContainingIgnoreCase(pageable, filter);
    }

    @Override
    public Page<Fournisseur> getFournisseurs(int page, int size) {
        return fournisseurRepository.findAll(new PageRequest(page, size));
    }

    @Override
    public void save(Fournisseur fournisseur) {
        String sql = "SELECT COUNT(*) FROM ACHAT.FOURNISSEUR";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        if (count != null && count == 0) {
            resetSequence();
        }
        fournisseurRepository.save(fournisseur);
    }

    @Override
    public Fournisseur findById(Long id) {
        return fournisseurRepository.findOne(id);
    }

    @Override
    public void deleteFournisseur(Fournisseur fournisseur) {
        fournisseurRepository.delete(fournisseur);
        /*        String sqlCount = "SELECT COUNT(*) FROM ACHAT.FOURNISSEUR";
        Long count = jdbcTemplate.queryForObject(sqlCount, Long.class);
        if (count != null && count == 0) {
            resetSequence();
        }*/
    }

    public void resetSequence() {
        String sql = "SELECT COALESCE(MAX(ID_FOURN), 0) FROM ACHAT.FOURNISSEUR";
        Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
        Long startValue = (maxId != null && maxId > 0) ? (maxId + 1) : 1L;
        jdbcTemplate.execute("ALTER SEQUENCE FOURNISSEUR_SEQ RESTART START WITH " + startValue);
    }

    private boolean isNoFilterApplied(String fournisseurDesignation, String designation) {
        return (fournisseurDesignation == null || fournisseurDesignation.isEmpty()) &&
                (designation == null || designation.isEmpty());
    }


}

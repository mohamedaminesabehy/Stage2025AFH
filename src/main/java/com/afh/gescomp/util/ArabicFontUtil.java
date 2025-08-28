package com.afh.gescomp.util;

import com.itextpdf.text.Font;
import com.itextpdf.text.pdf.BaseFont;
import com.itextpdf.text.FontFactory;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.stereotype.Component;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.Element;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import javax.annotation.PostConstruct;
import java.io.ByteArrayOutputStream;

/**
 * Utilitaire pour gérer les polices arabes dans les PDFs
 */
@Component
public class ArabicFontUtil {

    private static final Logger LOGGER = Logger.getLogger(ArabicFontUtil.class.getName());
    
    // Cache des polices pour éviter de les recharger
    private static final Map<String, Font> fontCache = new HashMap<>();
    
    // Polices système par défaut pour l'arabe
    private static final String[] ARABIC_SYSTEM_FONTS = {
        "Arial Unicode MS",
        "Tahoma",
        "Microsoft Uighur",
        "Segoe UI",
        "Arial",
        "Times New Roman"
    };
    
    // Police par défaut pour le texte non-arabe
    private static final String DEFAULT_FONT = "Arial";
    
    private BaseFont arabicBaseFont;
    private BaseFont latinBaseFont; // Nouvelle police pour le latin
    
    @PostConstruct
    public void initializeFonts() {
        try {
            // Police arabe Amiri (corriger le nom de fichier)
            InputStream arabicStream = getClass().getResourceAsStream("/fonts/arabic/Amiri-Regular.ttf");
            if (arabicStream != null) {
                byte[] arabicFontBytes = toByteArray(arabicStream);
                arabicBaseFont = BaseFont.createFont("Amiri-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, arabicFontBytes, null);
                arabicStream.close();
            }
            
            // Police latine standard (Helvetica)
            latinBaseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.EMBEDDED);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    // Méthode pour obtenir la police appropriée selon le contenu
    public Font getAppropriateFont(String text, float size, int style) {
        if (containsArabicText(text)) {
            return new Font(arabicBaseFont, size, style);
        } else {
            return new Font(latinBaseFont, size, style);
        }
    }
    
    /**
     * Obtient une police appropriée pour le texte donné (taille et style par défaut)
     * @param text Le texte à analyser
     * @return La police appropriée
     */
    public Font getAppropriateFont(String text) {
        return getAppropriateFont(text, 12, Font.NORMAL);
    }
    
    /**
     * Vérifie si le texte contient des caractères arabes
     * @param text Le texte à vérifier
     * @return true si le texte contient des caractères arabes
     */
    public boolean containsArabicText(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }
        
        for (char c : text.toCharArray()) {
            if (Character.UnicodeBlock.of(c) == Character.UnicodeBlock.ARABIC) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Obtient une police arabe
     * @param size La taille de la police
     * @param style Le style de la police
     * @return La police arabe
     */
    private Font getArabicFont(float size, int style) {
        String cacheKey = "arabic_" + size + "_" + style;
        
        if (fontCache.containsKey(cacheKey)) {
            return fontCache.get(cacheKey);
        }
        
        try {
            // Essayer d'utiliser une police système arabe
            Font arabicFont = getSystemArabicFont(size, style);
            if (arabicFont != null) {
                fontCache.put(cacheKey, arabicFont);
                return arabicFont;
            }
            
            // Fallback : utiliser BaseFont.IDENTITY_H avec une police par défaut
            Font fallbackFont = FontFactory.getFont(BaseFont.IDENTITY_H, size, style);
            fontCache.put(cacheKey, fallbackFont);
            return fallbackFont;
            
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Erreur lors du chargement de la police arabe: " + e.getMessage(), e);
            // Fallback final : police par défaut
            Font defaultFont = getDefaultFont(size, style);
            fontCache.put(cacheKey, defaultFont);
            return defaultFont;
        }
    }
    
    /**
     * Obtient une police arabe système
     * @param size La taille de la police
     * @param style Le style de la police
     * @return La police arabe système ou null si aucune n'est trouvée
     */
    private Font getSystemArabicFont(float size, int style) {
        for (String fontName : ARABIC_SYSTEM_FONTS) {
            try {
                // Vérifier si la police système existe
                if (isSystemFontAvailable(fontName)) {
                    Font font = FontFactory.getFont(fontName, size, style);
                    if (font != null) {
                        return font;
                    }
                }
            } catch (Exception e) {
                LOGGER.log(Level.FINE, "Police système non disponible: " + fontName, e);
            }
        }
        return null;
    }
    
    /**
     * Vérifie si une police système est disponible
     * @param fontName Le nom de la police
     * @return true si la police est disponible
     */
    private boolean isSystemFontAvailable(String fontName) {
        try {
            // Utiliser le nom complet de la classe pour éviter le conflit
            java.awt.Font font = new java.awt.Font(fontName, java.awt.Font.PLAIN, 12);
            return font.getFamily().equals(fontName);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Obtient la police par défaut
     * @param size La taille de la police
     * @param style Le style de la police
     * @return La police par défaut
     */
    private Font getDefaultFont(float size, int style) {
        String cacheKey = "default_" + size + "_" + style;
        
        if (fontCache.containsKey(cacheKey)) {
            return fontCache.get(cacheKey);
        }
        
        try {
            Font font = FontFactory.getFont(DEFAULT_FONT, size, style);
            fontCache.put(cacheKey, font);
            return font;
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Erreur lors du chargement de la police par défaut: " + e.getMessage(), e);
            // Fallback : police système
            Font systemFont = FontFactory.getFont(BaseFont.HELVETICA, size, style);
            fontCache.put(cacheKey, systemFont);
            return systemFont;
        }
    }
    
    /**
     * Nettoie le cache des polices
     */
    public void clearFontCache() {
        fontCache.clear();
    }
    
    /**
     * Obtient la taille du cache des polices
     * @return La taille du cache
     */
    public int getFontCacheSize() {
        return fontCache.size();
    }
    
    /**
     * Nettoie le texte arabe en supprimant les caractères spéciaux
     * @param text Le texte à nettoyer
     * @return Le texte nettoyé
     */
    public static String cleanArabicText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Supprimer les caractères spéciaux et normaliser
        return text.replaceAll("[^\\p{L}\\p{N}\\s\\-_\\.]", "").trim();
    }

    // Méthode helper compatible Java 7 pour convertir InputStream en byte[]
    private byte[] toByteArray(InputStream inputStream) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[16384];
        
        try {
            while ((nRead = inputStream.read(data, 0, data.length)) != -1) {
                buffer.write(data, 0, nRead);
            }
            buffer.flush();
        } finally {
            buffer.close();
        }
        
        return buffer.toByteArray();
    }
} 
package com.afh.gescomp.generator;

public class ArticleIdGenerator {
    public static String generateId(Short numsecteco, Short numssecteco, Short numfamille, Short numsfamille, String numArticle) {
        // Concaténer les parties sans tirets
        return String.format("%02d%02d%03d%04d%s",
                numsecteco.intValue(),
                numssecteco.intValue(),
                numfamille.intValue(),
                numsfamille.intValue(),
                numArticle);
    }
}

import { Article } from "./article";
import { MrcLot } from "./mrcLot";
import { PrmTypeSerie } from "./prmTypeSerie";

export interface MrcArticle {
    id: MrcArticleId; 
    numArticle: Article; 
    mrcLot: MrcLot; 
    tva: number; 
    quantite: number; 
    prixUnitaire: number; 
    idTypeSerie: PrmTypeSerie; 
    description: string;
    chAp: number;
    prixFourniture: number;
    codeArticle: string;

}

export interface MrcArticleId {
    numArticle: string;
    numMarche: number; 
    ap: number ; 
    idLot: string;
    idArticle: number | null;
}



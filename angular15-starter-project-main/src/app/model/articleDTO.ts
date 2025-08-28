export interface ArticleDTO {
    numArticle: string;
    numSectEco: string;
    numSSectEco: string;
    numFamille: string;
    numSFamille: string;
    libUnite: string;
    designation: string;
    historique: number;
    designationFr:string ;
    TVA: number | null;
    createdAt?: Date
  }
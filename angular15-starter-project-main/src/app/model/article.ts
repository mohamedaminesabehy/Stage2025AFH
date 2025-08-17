import { PrmTypeSerie } from "./prmTypeSerie";

export interface Article {
  numArticle: string;
  desigantion: string;
  designationFr: string;
  numSectEco: number | null; // Modifiez ici pour permettre null
  numSSectEco: number | null; // Modifiez ici pour permettre null
  numFamille: number | null; // Modifiez ici pour permettre null
  numSFamille: number | null; // Modifiez ici pour permettre null
  libUnite: string | null; // Modifiez ici pour permettre null
  TVA: number | null; // Modifiez ici pour permettre null
  designation: string | null; // Modifiez ici pour permettre null
  historique: string | null; // Modifiez ici pour permettre null
  description: string | null;
  prixUnitaire: string | null;
  quantite: string | null;
}

export interface PartialArticle {
  numArticle: string;
  designationFr: string;
}
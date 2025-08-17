import { Marche } from "./marche";

export interface MrcEtapeId {
    numMarche: number; 
    numEtape: number; 
  }

export interface MrcEtape {
    id: MrcEtapeId;
    numMarche: number;
    designation: string;
    dureePrev?: number; 
    pctPaiement?: number;
    dureeReelle?: number;
    dureeStop?: number;
    dureeRetard?: number;
    numMarcheDetails?: Marche;
}

export interface MrcEtapeRequest {
  numMarche: number;
  etapes: MrcEtape[];
}
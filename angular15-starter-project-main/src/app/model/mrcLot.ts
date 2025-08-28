import { Marche } from "./marche";

export interface MrcLot {
    id: MrcLotId; 
    numMarche: Marche; 
    idTypeLot: number; 
    designation: string;
}

export interface MrcLotId {
    numMarche: number;
    idLot: string; 
}

export interface MrcLotDto {
    numMarche?: number;
    idLot: string;
    idTypeLot?: number; 
    designation?: string; 
}

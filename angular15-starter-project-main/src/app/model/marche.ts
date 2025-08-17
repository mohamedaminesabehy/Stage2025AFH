import { Banque } from "./banque";
import { Fournisseur } from "./fournisseur";
import { nant } from "./nant";
import { plusMoinsValue } from "./plusMoinsValue";
import { PrmModePen } from "./prmModePen";
import { PrmStructure } from "./prmStructure";
import { typePFMarche } from "./typePFMarche";


export interface Marche {
    id: number;
    //--------//
    numMin: string;
    numAvMarche?: string;
    designation: string;
    rib?: string;
    dateMarche: Date;
    dateCm: Date;
    dateNotif: Date;
    dateEnreg: Date;
    dateConAdmin: Date;
    exercice: number;
    dureeContract?: number;
    numBanque: Banque;
    typePFMarche: typePFMarche;
    idFourn: Fournisseur;
    //---//
    numFourn?: string;
    //-à faire-//
    nant?: nant;
    numLot?: number;
    plusMoinsValue?: plusMoinsValue;
    // -details marche- //
    idStructure: PrmStructure;
    pctRetTva?: number;
    pctRetGar?: number;
    pctRetIr?: number;
    pctVdm?: number;
    pctMaxVdm?: number;
    pctTva?: number;
    pctRemise?: number;
    pctAvancePay?: number;
    pctRetAv?: number;
    dureeAvance?: number;
    //--Coordonees Penalite-Max--//
    pctMaxPenalite?: number;
    tauxPenJ?: number;
    montantPenJ?: number;
    exPen?: number;
    idModePen?:PrmModePen;
    mntMarche?: number; 
    mntMrcApresAvenant?:number;
}
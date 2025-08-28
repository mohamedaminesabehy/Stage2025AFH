export interface PrmLot {
    idLot: string;
    designation: string;
    idTypeLot: PrmTypeLot;    
  }
  
  export interface PrmTypeLot {
    idTypeLot: string;
    designation: string;
  }
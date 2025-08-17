export class MontantResponse {
    status: string;
    montantMarche: number;
    montantMarcheApresAvenant: number;
  
    constructor(status: string, montantMarche: number, montantMarcheApresAvenant: number) {
      this.status = status;
      this.montantMarche = montantMarche;
      this.montantMarcheApresAvenant = montantMarcheApresAvenant;
    }
  }
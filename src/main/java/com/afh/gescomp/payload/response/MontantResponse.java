package com.afh.gescomp.payload.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class MontantResponse {
    private String status;
    private BigDecimal montantMarche;
    private BigDecimal montantMarcheApresAvenant;

    public MontantResponse(String status) {
        this.status = status;
    }
}

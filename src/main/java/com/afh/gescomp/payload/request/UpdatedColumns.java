package com.afh.gescomp.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatedColumns {
    private BigDecimal quantite;
    private BigDecimal tva;
    private BigDecimal pctRea;
}

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
public class UpdatedDecMntColumns {
    private BigDecimal decFraisEnrg;
    private BigDecimal decAutreMnt;
}

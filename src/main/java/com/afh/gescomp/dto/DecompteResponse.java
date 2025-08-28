package com.afh.gescomp.dto;

import lombok.*;

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DecompteResponse {
    private boolean success;
    private String message;
    private Short numPieceFourn;
}

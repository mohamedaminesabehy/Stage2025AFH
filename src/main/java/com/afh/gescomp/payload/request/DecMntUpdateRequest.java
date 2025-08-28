package com.afh.gescomp.payload.request;

import com.afh.gescomp.model.primary.DecArticleId;
import com.afh.gescomp.model.primary.DecMntId;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DecMntUpdateRequest {
    private DecMntId idDecMnt;
    private UpdatedDecMntColumns updatedDecMntColumns;
}

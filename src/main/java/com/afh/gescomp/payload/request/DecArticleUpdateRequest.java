package com.afh.gescomp.payload.request;

import com.afh.gescomp.model.primary.DecArticleId;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DecArticleUpdateRequest {
    private DecArticleId idDecArticle;
    private UpdatedColumns updatedColumns;
}



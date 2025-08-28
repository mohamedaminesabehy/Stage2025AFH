package com.afh.gescomp.dto;

import com.afh.gescomp.model.primary.Article;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleResponse {
    private List<Article> articles;
    private long totalCount;
}

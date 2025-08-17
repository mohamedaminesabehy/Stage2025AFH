import { ArticleDTO } from "./articleDTO";

export interface ArticlePage {
    content: ArticleDTO[];
    totalElements: number;
    number: number;
    size: number;
    totalPages: number;
  }
import { TestBed } from '@angular/core/testing';

import { DecompteArticleService } from './decompte-article.service';

describe('DecompteArticleService', () => {
  let service: DecompteArticleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecompteArticleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

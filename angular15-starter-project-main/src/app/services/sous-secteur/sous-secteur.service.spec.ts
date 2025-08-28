import { TestBed } from '@angular/core/testing';

import { SousSecteurService } from './sous-secteur.service';

describe('SousSecteurService', () => {
  let service: SousSecteurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SousSecteurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

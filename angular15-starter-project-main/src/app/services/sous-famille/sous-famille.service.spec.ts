import { TestBed } from '@angular/core/testing';

import { SousFamilleService } from './sous-famille.service';

describe('SousFamilleService', () => {
  let service: SousFamilleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SousFamilleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

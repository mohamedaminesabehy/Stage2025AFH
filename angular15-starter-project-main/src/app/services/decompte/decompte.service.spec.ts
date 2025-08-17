import { TestBed } from '@angular/core/testing';

import { DecompteService } from './decompte.service';

describe('DecompteService', () => {
  let service: DecompteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecompteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

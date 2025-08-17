import { TestBed } from '@angular/core/testing';

import { DecPenaliteService } from './dec-penalite.service';

describe('DecPenaliteService', () => {
  let service: DecPenaliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecPenaliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

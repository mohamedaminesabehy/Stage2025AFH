import { TestBed } from '@angular/core/testing';

import { PenaliteService } from './penalite.service';

describe('PenaliteService', () => {
  let service: PenaliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PenaliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

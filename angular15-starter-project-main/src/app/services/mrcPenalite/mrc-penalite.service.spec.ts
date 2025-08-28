import { TestBed } from '@angular/core/testing';

import { MrcPenaliteService } from './mrc-penalite.service';

describe('MrcPenaliteService', () => {
  let service: MrcPenaliteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrcPenaliteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { DecLotServiceService } from './dec-lot-service.service';

describe('DecLotServiceService', () => {
  let service: DecLotServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecLotServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

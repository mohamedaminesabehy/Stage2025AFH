import { TestBed } from '@angular/core/testing';

import { PrmmodepenService } from './prmmodepen.service';

describe('PrmmodepenService', () => {
  let service: PrmmodepenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrmmodepenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

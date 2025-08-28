import { TestBed } from '@angular/core/testing';

import { PrmlotService } from './prmlot.service';

describe('PrmlotService', () => {
  let service: PrmlotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrmlotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

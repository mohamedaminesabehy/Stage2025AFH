import { TestBed } from '@angular/core/testing';

import { PrmstructureService } from './prmstructure.service';

describe('PrmstructureService', () => {
  let service: PrmstructureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrmstructureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

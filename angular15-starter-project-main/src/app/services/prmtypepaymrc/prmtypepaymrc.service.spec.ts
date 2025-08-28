import { TestBed } from '@angular/core/testing';

import { PrmtypepaymrcService } from './prmtypepaymrc.service';

describe('PrmtypepaymrcService', () => {
  let service: PrmtypepaymrcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrmtypepaymrcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

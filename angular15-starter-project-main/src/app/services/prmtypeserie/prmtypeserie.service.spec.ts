import { TestBed } from '@angular/core/testing';

import { PrmtypeserieService } from './prmtypeserie.service';

describe('PrmtypeserieService', () => {
  let service: PrmtypeserieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrmtypeserieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

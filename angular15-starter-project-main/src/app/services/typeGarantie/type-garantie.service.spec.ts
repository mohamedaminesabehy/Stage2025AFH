import { TestBed } from '@angular/core/testing';

import { TypeGarantieService } from './type-garantie.service';

describe('TypeGarantieService', () => {
  let service: TypeGarantieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeGarantieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

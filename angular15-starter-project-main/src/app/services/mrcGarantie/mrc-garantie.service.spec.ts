import { TestBed } from '@angular/core/testing';

import { MrcGarantieService } from './mrc-garantie.service';

describe('MrcGarantieService', () => {
  let service: MrcGarantieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrcGarantieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

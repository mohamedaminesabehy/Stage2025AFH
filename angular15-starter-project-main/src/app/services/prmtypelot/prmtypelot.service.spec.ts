import { TestBed } from '@angular/core/testing';

import { PrmtypelotService } from './prmtypelot.service';

describe('PrmtypelotService', () => {
  let service: PrmtypelotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrmtypelotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

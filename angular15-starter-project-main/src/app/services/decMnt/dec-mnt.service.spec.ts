import { TestBed } from '@angular/core/testing';

import { DecMntService } from './dec-mnt.service';

describe('DecMntService', () => {
  let service: DecMntService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecMntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

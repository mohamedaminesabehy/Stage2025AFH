import { TestBed } from '@angular/core/testing';

import { PrmTypeordreServService } from './prm-typeordre-serv.service';

describe('PrmTypeordreServService', () => {
  let service: PrmTypeordreServService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrmTypeordreServService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

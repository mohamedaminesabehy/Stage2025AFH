import { TestBed } from '@angular/core/testing';

import { OrdreServService } from './ordre-serv.service';

describe('OrdreServService', () => {
  let service: OrdreServService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdreServService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

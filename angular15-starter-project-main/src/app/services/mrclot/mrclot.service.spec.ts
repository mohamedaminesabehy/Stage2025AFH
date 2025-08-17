import { TestBed } from '@angular/core/testing';

import { MrclotService } from './mrclot.service';

describe('MrclotService', () => {
  let service: MrclotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrclotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

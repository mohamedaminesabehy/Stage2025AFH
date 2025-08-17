import { TestBed } from '@angular/core/testing';

import { MrcarticleService } from './mrcarticle.service';

describe('MrcarticleService', () => {
  let service: MrcarticleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MrcarticleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

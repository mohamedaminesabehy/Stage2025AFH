import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdreServiceComponent } from './ordre-service.component';

describe('OrdreServiceComponent', () => {
  let component: OrdreServiceComponent;
  let fixture: ComponentFixture<OrdreServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdreServiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdreServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

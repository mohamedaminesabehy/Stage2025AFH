import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaliteComponent } from './type-penalite.component';

describe('PenaliteComponent', () => {
  let component: PenaliteComponent;
  let fixture: ComponentFixture<PenaliteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PenaliteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PenaliteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

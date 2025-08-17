import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecompteComponent } from './decompte.component';

describe('DecompteComponent', () => {
  let component: DecompteComponent;
  let fixture: ComponentFixture<DecompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecompteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DecompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

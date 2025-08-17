import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeGarantieComponent } from './type-garantie.component';

describe('TypeGarantieComponent', () => {
  let component: TypeGarantieComponent;
  let fixture: ComponentFixture<TypeGarantieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeGarantieComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeGarantieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

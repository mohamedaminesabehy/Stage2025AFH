import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeGarantieAddEditComponent } from './type-garantie-add-edit.component';

describe('TypeGarantieAddEditComponent', () => {
  let component: TypeGarantieAddEditComponent;
  let fixture: ComponentFixture<TypeGarantieAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeGarantieAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeGarantieAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

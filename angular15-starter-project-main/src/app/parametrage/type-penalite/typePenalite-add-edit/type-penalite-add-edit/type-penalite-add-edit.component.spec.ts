import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePenaliteAddEditComponent } from './type-penalite-add-edit.component';

describe('TypePenaliteAddEditComponent', () => {
  let component: TypePenaliteAddEditComponent;
  let fixture: ComponentFixture<TypePenaliteAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePenaliteAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypePenaliteAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

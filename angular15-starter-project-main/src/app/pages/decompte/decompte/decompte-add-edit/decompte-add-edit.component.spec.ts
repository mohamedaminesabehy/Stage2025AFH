import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecompteAddEditComponent } from './decompte-add-edit.component';

describe('DecompteAddEditComponent', () => {
  let component: DecompteAddEditComponent;
  let fixture: ComponentFixture<DecompteAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecompteAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DecompteAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

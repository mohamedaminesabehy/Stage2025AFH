import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMarcheDialogComponent } from './select-marche-dialog.component';

describe('SelectMarcheDialogComponent', () => {
  let component: SelectMarcheDialogComponent;
  let fixture: ComponentFixture<SelectMarcheDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMarcheDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectMarcheDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

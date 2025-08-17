import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcheAddEditComponent } from './marche-add-edit.component';

describe('MarcheAddEditComponent', () => {
  let component: MarcheAddEditComponent;
  let fixture: ComponentFixture<MarcheAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcheAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarcheAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

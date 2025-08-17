import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FournAddEditComponent } from './fourn-add-edit.component';

describe('FournAddEditComponent', () => {
  let component: FournAddEditComponent;
  let fixture: ComponentFixture<FournAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FournAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FournAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

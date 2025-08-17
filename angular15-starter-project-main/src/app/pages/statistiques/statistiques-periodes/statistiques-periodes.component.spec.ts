import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiquesPeriodesComponent } from './statistiques-periodes.component';

describe('StatistiquesPeriodesComponent', () => {
  let component: StatistiquesPeriodesComponent;
  let fixture: ComponentFixture<StatistiquesPeriodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatistiquesPeriodesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatistiquesPeriodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

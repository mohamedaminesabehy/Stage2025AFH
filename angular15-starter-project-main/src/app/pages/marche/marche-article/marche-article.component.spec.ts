import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcheArticleComponent } from './marche-article.component';

describe('MarcheArticleComponent', () => {
  let component: MarcheArticleComponent;
  let fixture: ComponentFixture<MarcheArticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcheArticleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarcheArticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

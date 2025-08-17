import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecompteArticleEditComponent } from './decompte-article-edit.component';

describe('DecompteArticleEditComponent', () => {
  let component: DecompteArticleEditComponent;
  let fixture: ComponentFixture<DecompteArticleEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecompteArticleEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DecompteArticleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

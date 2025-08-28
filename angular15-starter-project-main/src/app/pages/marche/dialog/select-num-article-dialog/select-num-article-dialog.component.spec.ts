import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectNumArticleDialogComponent } from './select-num-article-dialog.component';

describe('SelectNumArticleDialogComponent', () => {
  let component: SelectNumArticleDialogComponent;
  let fixture: ComponentFixture<SelectNumArticleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectNumArticleDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectNumArticleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

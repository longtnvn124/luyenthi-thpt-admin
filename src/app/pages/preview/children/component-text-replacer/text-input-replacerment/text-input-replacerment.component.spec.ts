import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputReplacermentComponent } from './text-input-replacerment.component';

describe('TextInputReplacermentComponent', () => {
  let component: TextInputReplacermentComponent;
  let fixture: ComponentFixture<TextInputReplacermentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextInputReplacermentComponent]
    });
    fixture = TestBed.createComponent(TextInputReplacermentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

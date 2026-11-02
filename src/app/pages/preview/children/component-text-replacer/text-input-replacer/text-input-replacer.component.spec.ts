import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputReplacerComponent } from './text-input-replacer.component';

describe('TextInputReplacerComponent', () => {
  let component: TextInputReplacerComponent;
  let fixture: ComponentFixture<TextInputReplacerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextInputReplacerComponent]
    });
    fixture = TestBed.createComponent(TextInputReplacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

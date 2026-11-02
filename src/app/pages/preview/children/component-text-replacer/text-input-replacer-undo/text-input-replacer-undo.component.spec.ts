import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputReplacerUndoComponent } from './text-input-replacer-undo.component';

describe('TextInputReplacerUndoComponent', () => {
  let component: TextInputReplacerUndoComponent;
  let fixture: ComponentFixture<TextInputReplacerUndoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextInputReplacerUndoComponent]
    });
    fixture = TestBed.createComponent(TextInputReplacerUndoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

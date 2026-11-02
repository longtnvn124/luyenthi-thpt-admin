import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputReplacerExportComponent } from './text-input-replacer-export.component';

describe('TextInputReplacerExportComponent', () => {
  let component: TextInputReplacerExportComponent;
  let fixture: ComponentFixture<TextInputReplacerExportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextInputReplacerExportComponent]
    });
    fixture = TestBed.createComponent(TextInputReplacerExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
